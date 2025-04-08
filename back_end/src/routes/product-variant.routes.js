const express = require('express');
const bodyParser = require('body-parser');
const { productVariantController } = require('../controller');
const VerifyJwt = require('../middlewares/verifyJwt');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

const ProductVariantRouter = express.Router();
ProductVariantRouter.use(bodyParser.json());

// Public routes
ProductVariantRouter.get("/product/:productId", productVariantController.getVariantsByProductId);
ProductVariantRouter.get("/:id", productVariantController.getVariantById);

// Protected routes - requires authentication
ProductVariantRouter.post("/create", [VerifyJwt.verifyToken], productVariantController.createVariant);
ProductVariantRouter.put("/edit/:id", [VerifyJwt.verifyToken], productVariantController.updateVariant);
ProductVariantRouter.delete("/delete/:id", [VerifyJwt.verifyToken], productVariantController.deleteVariant);
ProductVariantRouter.put("/stock/:id", [VerifyJwt.verifyToken], productVariantController.updateVariantStock);
ProductVariantRouter.put("/product/:productId/default/:variantId", [VerifyJwt.verifyToken], productVariantController.setDefaultVariant);

// Route xử lý upload ảnh cho variant
ProductVariantRouter.post(
  "/upload-images/:id",
  [VerifyJwt.verifyToken],
  uploadMiddleware.handleVariantImagesUpload,
  productVariantController.uploadVariantImagesHandler
);

// Add new routes for soft delete and restore
ProductVariantRouter.put("/soft-delete/:id", [VerifyJwt.verifyToken], productVariantController.softDeleteVariant);
ProductVariantRouter.put("/restore/:id", [VerifyJwt.verifyToken], productVariantController.restoreVariant);
ProductVariantRouter.post("/bulk-soft-delete", [VerifyJwt.verifyToken], productVariantController.bulkSoftDeleteVariants);
ProductVariantRouter.post("/bulk-restore", [VerifyJwt.verifyToken], productVariantController.bulkRestoreVariants);

module.exports = ProductVariantRouter;