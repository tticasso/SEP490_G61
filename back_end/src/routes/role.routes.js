const express = require('express')
const bodyParser = require('body-parser')
const { roleController } = require('../controller')

const RoleRouter = express.Router()
RoleRouter.use(bodyParser.json())

RoleRouter.post("/create", roleController.create)

module.exports = RoleRouter