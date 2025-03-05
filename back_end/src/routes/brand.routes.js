const express = require('express')
const bodyParser = require('body-parser')
const { brandController } = require('../controller')

const BrandRouter = express.Router()
BrandRouter.use(bodyParser.json())

BrandRouter.get('/', brandController.getAllBrands);
BrandRouter.get('/:id', brandController.getBrandById);
BrandRouter.post('/create', brandController.createBrand);
BrandRouter.put('/edit/:id', brandController.updateBrand);
BrandRouter.delete('/delete/:id', brandController.deleteBrand);
module.exports = BrandRouter