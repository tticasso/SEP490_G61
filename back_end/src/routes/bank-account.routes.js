const express = require('express')
const bodyParser = require('body-parser')
const { bankAccountController } = require('../controller')

const BankAccountRouter = express.Router()
BankAccountRouter.use(bodyParser.json())

BankAccountRouter.get('/shop/:shopId', bankAccountController.getShopBankAccounts);
BankAccountRouter.get('/:id', bankAccountController.getBankAccountById);
BankAccountRouter.post('/create', bankAccountController.createBankAccount);
BankAccountRouter.put('/edit/:id', bankAccountController.updateBankAccount);
BankAccountRouter.delete('/delete/:id', bankAccountController.deleteBankAccount);

module.exports = BankAccountRouter