const express = require('express')
const bodyParser = require('body-parser')
const { categoriesController } = require('../controller')
const VerifySignUp = require('../middlewares/verifySignUp')
const VerifyJwt = require('../middlewares/verifyJwt')

const CategoriesRouter = express.Router()
CategoriesRouter.use(bodyParser.json())

CategoriesRouter.get('/', categoriesController.getAllCategories);
CategoriesRouter.get('/:id', categoriesController.getCategoryById);
CategoriesRouter.post('/create', [VerifyJwt.verifyToken], [VerifyJwt.isAdmin], categoriesController.createCategory);
CategoriesRouter.put('/edit/:id', categoriesController.updateCategory);
CategoriesRouter.delete('/delete/:id', categoriesController.deleteCategory);

module.exports = CategoriesRouter