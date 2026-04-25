import { Router } from "express";
import { getHomeContent, getStoreProducts, checkServiceArea, getPublicFAQs } from "../modules/customer/controllers/customerHomeController";

const router = Router();

// Public routes
router.get("/", getHomeContent);
router.get("/faqs", getPublicFAQs);
router.get("/check-service-area", checkServiceArea);
router.get("/store/:storeId", getStoreProducts);

export default router;
