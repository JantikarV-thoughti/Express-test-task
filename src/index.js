const express =require('express')
const dotenv = require('dotenv')
const testController = require("./controllers/test.controller")
const authController = require("./controllers/auth.controller")
const userController = require("./controllers/user.controller")

const PORT = process.env.PORT || 8989

const app = express()
dotenv.config()

app.use(express.json())
app.use("/test", testController)
app.use("/api/auth", authController)
app.use("/api/users", userController)

module.exports = {app, PORT}