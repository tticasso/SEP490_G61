const express = require('express')
const DBconnect = require('./src/config/db_config')
const bodyParser = require('body-parser')
const httpErrors = require('http-errors')
const morgan = require('morgan')

require('dotenv').config()
const app = express()

DBconnect();

app.use(async (req, res, next) => {
    next(httpErrors.NotFound())
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        "error": {
            "status": err.status || 500,
            "message": err.message
        }
    })
})

app.listen(process.env.PORT, process.env.HOST_NAME, () => {
    console.log(`Server is running port: http://${process.env.HOST_NAME}:${process.env.PORT}`);
})