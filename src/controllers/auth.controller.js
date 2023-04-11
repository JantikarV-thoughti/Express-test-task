const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const { Auth, validateAuth } = require("../models/auth.model");
const ApiHelper = require("../utils/api.helper");

const authenticate = require("../middlewares/authenticate.middleware.js");

const newToken = (user) => {
  return jwt.sign({ user_id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: 15 * 60,
  });
};

router.post("/register", async (req, res) => {
  try {
    const { error } = validateAuth(req.body);

    if (error) {
      ApiHelper.generateApiResponse(res, req, error.message, 400);
      return;
    }

    const existingUser = await Auth.findOne({ email: req.body.email });

    if (existingUser) {
      ApiHelper.generateApiResponse(res, req, "User already exists", 400);
      return;
    }

    const user = await Auth.create(req.body);

    ApiHelper.generateApiResponse(
      res,
      req,
      "User registered successfully",
      201,
      user
    );
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Something went wrong", 500);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await Auth.findOne({ email: req.body.email });

    if (!user) {
      ApiHelper.generateApiResponse(
        res,
        req,
        "Invalid username or password",
        400
      );
      return;
    }

    const match = user.checkPassword(req.body.password);

    if (!match) {
      ApiHelper.generateApiResponse(
        res,
        req,
        "Invalid username or password",
        400
      );
      return;
    }

    const token = newToken(user);

    let oldTokens = user.tokens || [];

    if (oldTokens.length) {
      oldTokens = oldTokens.filter((item) => {
        const timeDiff = (Date.now() - parseInt(item.signedAt)) / 1000;
        if (timeDiff < 900) {
          return item;
        }
      });
    }

    await Auth.findByIdAndUpdate(user._id, {
      tokens: [{ token, signedAt: Date.now().toString() }],
    });

    ApiHelper.generateApiResponse(
      res,
      req,
      "User logged in successfully.",
      200,
      token
    );
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Something went wrong", 500);
  }
});

router.post("/logout", authenticate, async (req, res) => {
  try {
    if (req.headers && req.headers.authorization) {

      const token = req.headers?.authorization.split(" ")[1]

      if(!token){
        ApiHelper.generateApiResponse(res, req, "Authorization fail", 401);
        return
      }

    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
