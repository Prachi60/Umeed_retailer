import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Commission from '../../../models/Commission';
import WalletTransaction from '../../../models/WalletTransaction';
import WithdrawRequest from '../../../models/WithdrawRequest';
import PlatformWallet from '../../../models/PlatformWallet';
import { asyncHandler } from '../../../utils/asyncHandler';
import { approveWithdrawal, rejectWithdrawal, completeWithdrawal } from './adminWithdrawalController';

/**
 * Get Financial Dashboard Stats
 */
export const getFinancialDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [
    sellerStats,
    deliveryStats,
    riderPayoutStats,
    commissionStats,
    orderStats,
    wallet
  ] = await Promise.all([
    // Total Seller Balances (Pending Payouts)
    mongoose.model('Seller').aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]),
    // Total Delivery Boy Balances (Pending Payouts)
    mongoose.model('Delivery').aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]),
    // Total Cash Collected by Delivery Boys (Gross amount they hold)
    mongoose.model('Delivery').aggregate([{ $group: { _id: null, total: { $sum: '$cashCollected' } } }]),
    // Total Admin Profits (Realized & Pending Commissions)
    Commission.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$commissionAmount' } } }]),
    // Total Sales Volume (GMV)
    mongoose.model('Order').aggregate([
      { $match: { status: { $in: ['Delivered', 'Completed'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    // Current Liquid Cash (Keep wallet as primary for this as it tracks inflow/outflow)
    PlatformWallet.getWallet()
  ]);

  const stats = {
    totalGMV: orderStats[0]?.total || 0,
    currentAccountBalance: wallet.currentPlatformBalance,
    totalAdminEarnings: commissionStats[0]?.total || 0,
    sellerPendingPayouts: sellerStats[0]?.total || 0,
    deliveryPendingPayouts: deliveryStats[0]?.total || 0,
    pendingFromDeliveryBoy: riderPayoutStats[0]?.total || 0,
    pendingWithdrawalsCount: await WithdrawRequest.countDocuments({ status: 'Pending' })
  };

  // Optional: Sync the platform wallet counters with these real numbers
  try {
    wallet.totalPlatformEarning = stats.totalGMV;
    wallet.totalAdminEarning = stats.totalAdminEarnings;
    wallet.sellerPendingPayouts = stats.sellerPendingPayouts;
    wallet.deliveryBoyPendingPayouts = stats.deliveryPendingPayouts;
    wallet.pendingFromDeliveryBoy = stats.pendingFromDeliveryBoy;
    await wallet.save();
  } catch (err) {
    console.error("Sync error in financial dashboard:", err);
  }

  return res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * Get Admin Earnings (Commissions List)
 */
export const getAdminEarnings = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;

  const query: any = {};
  if (status) query.status = status;
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
    if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const earnings = await Commission.find(query)
    .populate('order', 'orderNumber')
    .populate('seller', 'storeName sellerName')
    .populate('deliveryBoy', 'name mobile')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Commission.countDocuments(query);

  // Format data for frontend
  const formattedEarnings = earnings.map(e => {
    let sourceName = 'Unknown';
    if (e.type === 'SELLER' && e.seller) {
      sourceName = (e.seller as any).storeName || (e.seller as any).sellerName;
    } else if (e.type === 'DELIVERY_BOY' && e.deliveryBoy) {
      sourceName = (e.deliveryBoy as any).name;
    }

    return {
      id: e._id,
      source: sourceName,
      sourceType: e.type,
      amount: e.commissionAmount,
      date: e.createdAt,
      status: e.status,
      description: `Order #${(e.order as any)?.orderNumber || 'Unknown'}`,
      orderId: (e.order as any)?._id
    };
  });

  return res.status(200).json({
    success: true,
    data: formattedEarnings,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * Get All Wallet Transactions (Sellers & Delivery Boys)
 */
/**
 * Get All Wallet Transactions (Sellers & Delivery Boys)
 */
export const getWalletTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, type, userType, search: _search } = req.query;

  const query: any = {};
  if (type) query.type = type;
  if (userType) query.userType = userType;

  // Search handling not fully implemented for cross-collection ref

  const skip = (Number(page) - 1) * Number(limit);

  // Fetch transactions without populate first, as refPath 'userType' values (SELLER/DELIVERY_BOY) 
  // do not match Model names (Seller/Delivery)
  const transactions = await WalletTransaction.find(query)
    .populate('relatedOrder', 'orderNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await WalletTransaction.countDocuments(query);

  // Manually populate user details
  const sellerIds: any[] = [];
  const deliveryIds: any[] = [];

  transactions.forEach(t => {
    if (t.userType === 'SELLER') sellerIds.push(t.userId);
    else if (t.userType === 'DELIVERY_BOY') deliveryIds.push(t.userId);
  });

  const [sellers, deliveryBoys] = await Promise.all([
    mongoose.model('Seller').find({ _id: { $in: sellerIds } }).select('storeName sellerName mobile email'),
    mongoose.model('Delivery').find({ _id: { $in: deliveryIds } }).select('name firstName lastName mobile email')
  ]);

  const sellerMap = new Map(sellers.map(s => [s._id.toString(), s]));
  const deliveryMap = new Map(deliveryBoys.map(d => [d._id.toString(), d]));

  // Format transactions
  const formattedTransactions = transactions.map((t: any) => {
    let userName = 'Unknown';
    let user: any = null;

    if (t.userType === 'SELLER') {
      user = sellerMap.get(t.userId.toString());
      if (user) {
        userName = user.storeName || user.sellerName;
      }
    } else if (t.userType === 'DELIVERY_BOY') {
      user = deliveryMap.get(t.userId.toString());
      if (user) {
        userName = user.name || (user.firstName ? user.firstName + (user.lastName ? ' ' + user.lastName : '') : 'Delivery Partner');
      }
    }

    return {
      _id: t._id,
      type: t.type,
      userType: t.userType,
      userName: userName,
      userId: user, // Return full user object or just ID based on frontend need, ensuring compatibility
      amount: t.amount,
      description: t.description,
      status: t.status,
      createdAt: t.createdAt,
      reference: t.reference,
      relatedOrder: t.relatedOrder ? { orderNumber: t.relatedOrder.orderNumber } : undefined
    };
  });

  return res.status(200).json({
    success: true,
    data: formattedTransactions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * Process Withdrawal Wrapper (to match frontend service expectation)
 */
export const processWithdrawalWrapper = asyncHandler(async (req: Request, res: Response) => {
  const { requestId, action, remark, transactionReference } = req.body;

  if (!requestId || !action) {
    return res.status(400).json({
      success: false,
      message: 'Request ID and action are required'
    });
  }

  // Mock the params for the existing controllers
  req.params.id = requestId;

  if (action === 'Approve') {
    return approveWithdrawal(req, res);
  } else if (action === 'Reject') {
    req.body.remarks = remark; // Map 'remark' to 'remarks'
    return rejectWithdrawal(req, res);
  } else if (action === 'Complete') {
    if (!transactionReference) {
      return res.status(400).json({
        success: false,
        message: 'Transaction reference is required for completion'
      });
    }
    req.body.transactionReference = transactionReference;
    return completeWithdrawal(req, res);
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Must be "Approve", "Reject", or "Complete"'
    });
  }
});

/**
 * Get Seller Transactions
 */
export const getSellerTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  const { page = 1, limit = 50, type } = req.query;

  const query: any = {
    userType: 'SELLER'
  };

  if (sellerId !== 'all') {
    query.userId = sellerId;
  }

  if (type && type !== 'all') {
    // Capitalize first letter to match model (Credit/Debit)
    query.type = (type as string).charAt(0).toUpperCase() + (type as string).slice(1).toLowerCase();
  }

  const skip = (Number(page) - 1) * Number(limit);

  const transactions = await WalletTransaction.find(query)
    .populate('relatedOrder', 'orderNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await WalletTransaction.countDocuments(query);

  const formattedTransactions = transactions.map((t: any) => {
    const isOrder = t.relatedOrder || t.description.includes('Order #');
    const orderNumber = t.relatedOrder ? t.relatedOrder.orderNumber : (t.description.includes('Order #') ? t.description.split('#')[1] : undefined);
    
    return {
      id: t._id,
      amount: t.amount,
      transactionType: t.type.toLowerCase(), // frontend expects 'credit'/'debit'
      date: t.createdAt,
      type: t.type,
      status: t.status,
      description: t.description,
      orderId: orderNumber,
      productName: isOrder ? 'Order Sale' : t.type
    };
  });

  return res.status(200).json({
    success: true,
    data: formattedTransactions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * Get Delivery Boy Transactions
 */
export const getDeliveryBoyTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { deliveryBoyId } = req.params;
  const { page = 1, limit = 50, type } = req.query;

  const query: any = {
    userType: 'DELIVERY_BOY'
  };

  if (deliveryBoyId !== 'all') {
    query.userId = deliveryBoyId;
  }

  if (type && type !== 'all') {
    query.type = (type as string).charAt(0).toUpperCase() + (type as string).slice(1).toLowerCase();
  }

  const skip = (Number(page) - 1) * Number(limit);

  const transactions = await WalletTransaction.find(query)
    .populate('relatedOrder', 'orderNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await WalletTransaction.countDocuments(query);

  const formattedTransactions = transactions.map((t: any) => {
    const isOrder = t.relatedOrder || t.description.includes('Order #');
    const orderNumber = t.relatedOrder ? t.relatedOrder.orderNumber : (t.description.includes('Order #') ? t.description.split('#')[1] : undefined);
    
    return {
      id: t._id,
      amount: t.amount,
      transactionType: t.type.toLowerCase(),
      date: t.createdAt,
      type: t.type,
      status: t.status,
      description: t.description,
      orderId: orderNumber,
      productName: isOrder ? 'Order Commission' : t.type
    };
  });

  return res.status(200).json({
    success: true,
    data: formattedTransactions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * Manual Fund Transfer (Credit/Debit)
 */
export const manualFundTransfer = asyncHandler(async (req: Request, res: Response) => {
  const { sellerId, userId, userType = 'SELLER', amount, type, description } = req.body;
  const targetId = userId || sellerId;

  if (!targetId || amount === undefined || Number(amount) <= 0 || !type || !description) {
    return res.status(400).json({
      success: false,
      message: 'All fields (userId/sellerId, amount, type, description) are required and amount must be positive'
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let userModel;
    if (userType === 'SELLER') {
      userModel = mongoose.model('Seller');
    } else if (userType === 'DELIVERY_BOY') {
      userModel = mongoose.model('Delivery');
    } else {
      throw new Error('Invalid user type');
    }

    const user = await userModel.findById(targetId).session(session);

    if (!user) {
      throw new Error(`${userType === 'SELLER' ? 'Seller' : 'Delivery boy'} not found`);
    }

    const amountNum = Number(amount);
    if (type === 'Credit') {
      user.balance = (user.balance || 0) + amountNum;
    } else {
      if ((user.balance || 0) < amountNum) {
        throw new Error(`Insufficient balance in ${userType.toLowerCase()} wallet`);
      }
      user.balance = (user.balance || 0) - amountNum;
    }

    await user.save({ session });

    // Create transaction record
    const transaction = await WalletTransaction.create([{
      userId: targetId,
      userType,
      amount: amountNum,
      type,
      description,
      status: 'Completed',
      reference: `ADJ-${Date.now()}`
    }], { session });

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: `Fund ${type.toLowerCase()}ed successfully`,
      data: transaction[0]
    });
  } catch (error: any) {
    await session.abortTransaction();
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to process fund transfer'
    });
  } finally {
    session.endSession();
  }
});

/**
 * Get Seller Wallet Stats
 */
export const getSellerWalletStats = asyncHandler(async (req: Request, res: Response) => {
  const { sellerId } = req.params;

  const query: any = { userType: 'SELLER' };
  if (sellerId !== 'all') {
    query.userId = new mongoose.Types.ObjectId(sellerId);
  }

  const stats = await WalletTransaction.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalEarned: {
          $sum: { $cond: [{ $eq: ['$type', 'Credit'] }, '$amount', 0] }
        },
        totalWithdrawn: {
          $sum: { $cond: [{ $eq: ['$type', 'Debit'] }, '$amount', 0] }
        }
      }
    }
  ]);

  let currentBalance = 0;
  if (sellerId !== 'all') {
    const seller = await mongoose.model('Seller').findById(sellerId).select('balance');
    currentBalance = seller?.balance || 0;
  } else {
    const result = await mongoose.model('Seller').aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
    ]);
    currentBalance = result[0]?.totalBalance || 0;
  }

  return res.status(200).json({
    success: true,
    data: {
      totalEarned: currentBalance + (stats[0]?.totalWithdrawn || 0),
      totalWithdrawn: stats[0]?.totalWithdrawn || 0,
      currentBalance
    }
  });
});

/**
 * Get Delivery Boy Wallet Stats
 */
export const getDeliveryBoyWalletStats = asyncHandler(async (req: Request, res: Response) => {
  const { deliveryBoyId } = req.params;

  const query: any = { userType: 'DELIVERY_BOY' };
  if (deliveryBoyId !== 'all') {
    query.userId = new mongoose.Types.ObjectId(deliveryBoyId);
  }

  const stats = await WalletTransaction.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalEarned: {
          $sum: { $cond: [{ $eq: ['$type', 'Credit'] }, '$amount', 0] }
        },
        totalWithdrawn: {
          $sum: { $cond: [{ $eq: ['$type', 'Debit'] }, '$amount', 0] }
        }
      }
    }
  ]);

  let currentBalance = 0;
  if (deliveryBoyId !== 'all') {
    const delivery = await mongoose.model('Delivery').findById(deliveryBoyId).select('balance');
    currentBalance = delivery?.balance || 0;
  } else {
    const result = await mongoose.model('Delivery').aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
    ]);
    currentBalance = result[0]?.totalBalance || 0;
  }

  return res.status(200).json({
    success: true,
    data: {
      totalEarned: currentBalance + (stats[0]?.totalWithdrawn || 0),
      totalWithdrawn: stats[0]?.totalWithdrawn || 0,
      currentBalance
    }
  });
});

/**
 * Get Seller Settlement Stats (Aggregated)
 */
export const getSellerSettlementStats = asyncHandler(async (_req: Request, res: Response) => {
  const [sellerStats, deliveryStats, riderPayoutStats] = await Promise.all([
    // Actual sum of all seller balances
    mongoose.model('Seller').aggregate([{ $group: { _id: null, totalBalance: { $sum: '$balance' } } }]),
    // Specific Breakdown of seller transactions for context
    WalletTransaction.aggregate([
      { $match: { userType: 'SELLER', status: 'Completed' } },
      {
        $lookup: { from: 'orders', localField: 'relatedOrder', foreignField: '_id', as: 'orderInfo' }
      },
      {
        $addFields: { paymentMethod: { $arrayElemAt: ['$orderInfo.paymentMethod', 0] } }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: { $cond: [{ $eq: ['$type', 'Credit'] }, '$amount', 0] } },
          onlineEarnings: { 
            $sum: { $cond: [{ $and: [{ $eq: ['$type', 'Credit'] }, { $ne: ['$paymentMethod', 'COD'] }] }, '$amount', 0] } 
          },
          codEarnings: { 
            $sum: { $cond: [{ $and: [{ $eq: ['$type', 'Credit'] }, { $eq: ['$paymentMethod', 'COD'] }] }, '$amount', 0] } 
          },
          totalPaid: { $sum: { $cond: [{ $eq: ['$type', 'Debit'] }, '$amount', 0] } }
        }
      }
    ]),
    // Gross amount held by Riders
    mongoose.model('Delivery').aggregate([{ $group: { _id: null, totalPending: { $sum: '$cashCollected' } } }])
  ]);

  const txStats = deliveryStats[0] || { totalEarnings: 0, onlineEarnings: 0, codEarnings: 0, totalPaid: 0 };
  const currentBalance = sellerStats[0]?.totalBalance || 0;
  
  const stats = {
    totalSellerEarnings: currentBalance + txStats.totalPaid, // Cumulative historic earnings
    onlineEarnings: txStats.onlineEarnings,
    codCollected: txStats.codEarnings,
    alreadyPaid: txStats.totalPaid,
    availableToSettle: currentBalance, // Current sum of all seller balances
    pendingCOD: riderPayoutStats[0]?.totalPending || 0 // Matches Admin Wallet dashboard
  };

  return res.status(200).json({
    success: true,
    data: stats
  });
});
