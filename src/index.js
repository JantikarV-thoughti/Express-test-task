const express =require("express")

const testController = require("./controllers/test.controller")
const authController = require("./controllers/auth.controller")
const userController = require("./controllers/user.controller")
const postController = require("./controllers/post.controller")

const app = express()

app.use(express.json())
app.use("/test", testController)
app.use("/api/auth", authController)
app.use("/api/users", userController)
app.use("/api/posts", postController)

module.exports = app