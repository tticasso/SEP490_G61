const express = require('express')
const bodyParser = require('body-parser')
const { productController } = require('../controller')


const ProductRouter = express.Router()
ProductRouter.use(bodyParser.json())

ProductRouter.get("/", productController.getAllProducts);
ProductRouter.get("/:id", productController.getProductById);
ProductRouter.post("/create", productController.createProduct);
ProductRouter.put("/edit/:id", productController.updateProduct);
ProductRouter.delete("/delete/:id", productController.deleteProduct);

module.exports = ProductRouter