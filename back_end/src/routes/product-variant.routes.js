const express = require('express');
const bodyParser = require('body-parser');
const { productVariantController } = require('../controller');
const VerifyJwt = require('../middlewares/verifyJwt');

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

module.exports = ProductVariantRouter;