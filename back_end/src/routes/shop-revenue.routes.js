const express = require('express');
const bodyParser = require('body-parser');
const shopRevenueController = require('../controller/shop-revenue.controller');
const VerifyJwt = require('../middlewares/verifyJwt');

const ShopRevenueRouter = express.Router();
ShopRevenueRouter.use(bodyParser.json());

// Create revenue record for a delivered order
ShopRevenueRouter.post(
    "/create",
    [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller],
    shopRevenueController.createRevenueRecord
);

// Get revenue statistics for a specific shop
ShopRevenueRouter.get(
    "/shop/:shop_id/stats",
    [VerifyJwt.verifyToken,VerifyJwt.isAdminOrSeller],
    shopRevenueController.getShopRevenueStats
);

// Get unpaid revenue details for a shop
ShopRevenueRouter.get(
    "/shop/:shop_id/unpaid",
    [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller],
    shopRevenueController.getUnpaidRevenue
);

// Create payment batch (admin only)
ShopRevenueRouter.post(
    "/batch/create",
    [VerifyJwt.verifyToken, VerifyJwt.isAdmin],
    shopRevenueController.createPaymentBatch
);

// Process payment batch (admin only)
ShopRevenueRouter.post(
    "/batch/:batch_id/process",
    [VerifyJwt.verifyToken, VerifyJwt.isAdmin],
    shopRevenueController.processPaymentBatch
);

// Get payment batch details
ShopRevenueRouter.get(
    "/batch/:batch_id",
    [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller],
    shopRevenueController.getPaymentBatchDetails
);

// Get all payment batches with pagination
ShopRevenueRouter.get(
    "/batches",
    [VerifyJwt.verifyToken, VerifyJwt.isAdmin],
    shopRevenueController.getAllPaymentBatches
);

// Get platform revenue statistics (admin only)
ShopRevenueRouter.get(
    "/platform/stats",
    [VerifyJwt.verifyToken, VerifyJwt.isAdmin],
    shopRevenueController.getPlatformRevenue
);

ShopRevenueRouter.get(
    "/shops/payment-summary",
    [VerifyJwt.verifyToken, VerifyJwt.isAdmin],
    shopRevenueController.getShopsPaymentSummary
);

ShopRevenueRouter.get(
    "/system/overview",
    [VerifyJwt.verifyToken, VerifyJwt.isAdmin],
    shopRevenueController.getSystemRevenueOverview
);

module.exports = ShopRevenueRouter;