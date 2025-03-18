const express = require('express')
const bodyParser = require('body-parser')
const { productController } = require('../controller')
const VerifyJwt = require('../middlewares/verifyJwt');

const ProductRouter = express.Router()
ProductRouter.use(bodyParser.json())

// Public routes
ProductRouter.get("/", productController.getAllProducts);
ProductRouter.get("/shop/:shopId", productController.getProductsByShopId); // Route for getting products by shop ID
ProductRouter.get("/user/:userId", productController.getProductsByUserId);
ProductRouter.get("/:id", productController.getProductById); // This must come after other specific routes

// Protected routes - requires authentication
ProductRouter.post("/create", [VerifyJwt.verifyToken], productController.createProduct);
ProductRouter.put("/edit/:id", [VerifyJwt.verifyToken], productController.updateProduct);
ProductRouter.delete("/delete/:id", [VerifyJwt.verifyToken], productController.deleteProduct);

// Thêm routes mới cho xóa mềm và khôi phục
ProductRouter.put("/soft-delete/:id", [VerifyJwt.verifyToken], productController.softDeleteProduct);
ProductRouter.put("/restore/:id", [VerifyJwt.verifyToken], productController.restoreProduct);
ProductRouter.post("/bulk-soft-delete", [VerifyJwt.verifyToken], productController.bulkSoftDeleteProducts);
ProductRouter.post("/bulk-restore", [VerifyJwt.verifyToken], productController.bulkRestoreProducts);

module.exports = ProductRouter