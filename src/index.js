const express =require('express')
const testController = require("./controllers/test.controller")

const app = express()

app.use(express.json())
app.use("/test", testController)

module.exports = app