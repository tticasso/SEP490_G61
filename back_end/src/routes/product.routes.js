const express = require('express')
const bodyParser = require('body-parser')
const { productController } = require('../controller')
const VerifyJwt = require('../middlewares/verifyJwt');

const ProductRouter = express.Router()
// Không sử dụng bodyParser.json() ở đây nữa vì nó sẽ xung đột với multer
// (multer yêu cầu request dạng multipart/form-data)

// Public routes
ProductRouter.get("/", productController.getAllProducts);
ProductRouter.get("/shop/:shopId", productController.getProductsByShopId); // Route for getting products by shop ID
ProductRouter.get("/user/:userId", productController.getProductsByUserId);
ProductRouter.get("/:id/with-variants", productController.getProductWithVariants); // Add new route for products with variants
ProductRouter.get("/:id", productController.getProductById); // This must come after other specific routes

// Protected routes - requires authentication
// Thêm middleware xử lý upload ảnh trước khi xử lý request
ProductRouter.post("/create",
    [VerifyJwt.verifyToken, productController.handleProductImageUpload],
    productController.createProduct
);
ProductRouter.put("/edit/:id",
    [VerifyJwt.verifyToken, productController.handleProductImageUpload],
    productController.updateProduct
);
ProductRouter.delete("/delete/:id", [VerifyJwt.verifyToken], productController.deleteProduct);

// Thêm routes mới cho xóa mềm và khôi phục
ProductRouter.put("/soft-delete/:id", [VerifyJwt.verifyToken], productController.softDeleteProduct);
ProductRouter.put("/restore/:id", [VerifyJwt.verifyToken], productController.restoreProduct);
ProductRouter.post("/bulk-soft-delete", [VerifyJwt.verifyToken], productController.bulkSoftDeleteProducts);
ProductRouter.post("/bulk-restore", [VerifyJwt.verifyToken], productController.bulkRestoreProducts);

ProductRouter.put("/toggle-status/:id", [VerifyJwt.verifyToken], productController.toggleProductStatus);
module.exports = ProductRouter