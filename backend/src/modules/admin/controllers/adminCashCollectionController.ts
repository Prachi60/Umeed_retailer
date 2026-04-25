import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../../../utils/asyncHandler";
import CashCollection from "../../../models/CashCollection";
import Delivery from "../../../models/Delivery";
import Order from "../../../models/Order";
import { IDelivery } from "../../../models/Delivery";

/**
 * Get all cash collections
 */
export const getCashCollections = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            deliveryBoyId,
            fromDate,
            toDate,
            // search = "",
            sortBy = "collectedAt",
            sortOrder = "desc",
        } = req.query;

        const query: any = {};

        // Filter by delivery boy
        if (deliveryBoyId) {
            query.deliveryBoy = deliveryBoyId;
        }

        // Date range filter
        if (fromDate || toDate) {
            query.collectedAt = {};
            if (fromDate) {
                query.collectedAt.$gte = new Date(fromDate as string);
            }
            if (toDate) {
                query.collectedAt.$lte = new Date(toDate as string);
            }
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const sort: any = {};
        sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

        const [collections, total] = await Promise.all([
            CashCollection.find(query)
                .populate("deliveryBoy", "name mobile")
                .populate("order", "orderNumber total")
                .populate("collectedBy", "name")
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit as string)),
            CashCollection.countDocuments(query),
        ]);

        // Transform data to match frontend expectations
        const transformedCollections = collections.map((collection: any) => ({
            _id: collection._id,
            deliveryBoyId: collection.deliveryBoy?._id,
            deliveryBoyName: collection.deliveryBoy?.name || "Unknown",
            orderId: collection.order?._id,
            total: collection.order?.total || 0,
            amount: collection.amount,
            remark: collection.remark,
            collectedAt: collection.collectedAt,
            collectedBy: collection.collectedBy?.name || "Unknown",
        }));

        return res.status(200).json({
            success: true,
            message: "Cash collections fetched successfully",
            data: transformedCollections,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                pages: Math.ceil(total / parseInt(limit as string)),
            },
        });
    }
);

/**
 * Get cash collection summary statistics
 */
export const getCashCollectionSummary = asyncHandler(
    async (req: Request, res: Response) => {
        const [submittedResult, pendingResult, agentsWithPending] = await Promise.all([
            // Calculate total submitted
            CashCollection.aggregate([
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            // Calculate total pending from delivery agents
            Delivery.aggregate([
                { $group: { _id: null, total: { $sum: "$cashCollected" } } }
            ]),
            // Count agents with pending cash
            Delivery.countDocuments({ cashCollected: { $gt: 0 }, status: "Active" })
        ]);

        const totalSubmitted = submittedResult[0]?.total || 0;
        const pendingAmount = pendingResult[0]?.total || 0;
        const totalCollected = totalSubmitted + pendingAmount;

        return res.status(200).json({
            success: true,
            data: {
                totalCollected,
                totalSubmitted,
                pendingAmount,
                agentsWithPending
            }
        });
    }
);

/**
 * Get cash collection by ID
 */
export const getCashCollectionById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const collection = await CashCollection.findById(id)
            .populate("deliveryBoy", "name mobile")
            .populate("order", "orderNumber total")
            .populate("collectedBy", "name");

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: "Cash collection not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cash collection fetched successfully",
            data: collection,
        });
    }
);

/**
 * Create cash collection
 */
export const createCashCollection = asyncHandler(
    async (req: Request, res: Response) => {
        const { deliveryBoyId, orderId, referenceId, amount, remark } = req.body;

        if (!deliveryBoyId || amount === undefined || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid positive amount is required",
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Verify delivery boy exists
            const deliveryBoy = await Delivery.findById(deliveryBoyId).session(session);
            if (!deliveryBoy) {
                throw new Error("Delivery boy not found");
            }

            // Verify order exists if provided and is a valid ObjectId
            let validOrderId = null;
            if (orderId && /^[0-9a-fA-F]{24}$/.test(orderId)) {
                const order = await Order.findById(orderId).session(session);
                if (order) {
                    validOrderId = orderId;
                }
            }

            // Create cash collection
            const collection = await CashCollection.create([{
                deliveryBoy: deliveryBoyId,
                order: validOrderId,
                referenceId: referenceId || (orderId && !validOrderId ? orderId : null),
                amount,
                remark,
                collectedBy: req.user?.userId,
                collectedAt: new Date(),
            }], { session });

            // Update delivery boy's cash collected (Gross) and pending admin payout (Net)
            deliveryBoy.cashCollected = Math.max(0, (deliveryBoy.cashCollected || 0) - amount);
            deliveryBoy.pendingAdminPayout = Math.max(0, (deliveryBoy.pendingAdminPayout || 0) - amount);
            await deliveryBoy.save({ session });

            // Update Platform Wallet tracking
            try {
                const PlatformWallet = (await import('../../../models/PlatformWallet')).default;
                const wallet = await PlatformWallet.getWallet();
                
                wallet.currentPlatformBalance += amount;
                wallet.pendingFromDeliveryBoy = Math.max(0, wallet.pendingFromDeliveryBoy - amount);
                
                await (wallet as any).save({ session });
            } catch (pwError) {
                console.error("Error updating platform wallet in createCashCollection:", pwError);
            }

            // Process pending payouts to sellers
            try {
                const { processPendingCODPayouts } = await import('../../../services/commissionService');
                await processPendingCODPayouts(deliveryBoyId, amount, session);
            } catch (payoutError) {
                console.error("Error processing payouts in createCashCollection:", payoutError);
            }

            await session.commitTransaction();

            const populatedCollection = await CashCollection.findById(collection[0]._id)
                .populate("deliveryBoy", "name mobile")
                .populate("order", "orderNumber total")
                .populate("collectedBy", "name");

            return res.status(201).json({
                success: true,
                message: "Cash collection created successfully",
                data: populatedCollection,
            });
        } catch (error: any) {
            await session.abortTransaction();
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to create cash collection",
            });
        } finally {
            session.endSession();
        }
    }
);

/**
 * Update cash collection
 */
export const updateCashCollection = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const { amount, remark } = req.body;

        const collection = await CashCollection.findById(id);

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: "Cash collection not found",
            });
        }

        // If amount is being updated, adjust delivery boy's cash collected
        if (amount !== undefined && amount !== collection.amount) {
            const deliveryBoy = await Delivery.findById(collection.deliveryBoy);
            if (deliveryBoy) {
                const difference = collection.amount - amount;
                deliveryBoy.cashCollected =
                    (deliveryBoy.cashCollected || 0) + difference;
                await deliveryBoy.save();
            }
            collection.amount = amount;
        }

        if (remark !== undefined) {
            collection.remark = remark;
        }

        await collection.save();

        const updatedCollection = await CashCollection.findById(id)
            .populate("deliveryBoy", "name mobile")
            .populate("order", "orderNumber total")
            .populate("collectedBy", "name");

        return res.status(200).json({
            success: true,
            message: "Cash collection updated successfully",
            data: updatedCollection,
        });
    }
);

/**
 * Delete cash collection
 */
export const deleteCashCollection = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const collection = await CashCollection.findById(id);

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: "Cash collection not found",
            });
        }

        // Restore the amount to delivery boy's cash collected
        const deliveryBoy = await Delivery.findById(collection.deliveryBoy);
        if (deliveryBoy) {
            deliveryBoy.cashCollected =
                (deliveryBoy.cashCollected || 0) + collection.amount;
            await deliveryBoy.save();
        }

        await CashCollection.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Cash collection deleted successfully",
        });
    }
);
