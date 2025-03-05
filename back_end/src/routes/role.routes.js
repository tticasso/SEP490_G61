const express = require('express')
const bodyParser = require('body-parser')
const { roleController } = require('../controller')

const roleRouter = express.Router()
roleRouter.use(bodyParser.json())

roleRouter.post("/create", roleController.create)

module.exports = roleRouter