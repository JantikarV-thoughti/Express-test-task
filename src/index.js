const express = require("express");

const testController = require("./controllers/test.controller");
const authController = require("./controllers/auth.controller");
const userController = require("./controllers/user.controller");
const postController = require("./controllers/post.controller");
const AuthMiddleware = require("./middlewares/authenticate.middleware");

const app = express();

app.use(express.json());
app.use("/test", testController);
app.use("/api/auth", authController);
app.use("/api/users", userController);
app.use("/api/posts", AuthMiddleware, postController);

module.exports = app;
