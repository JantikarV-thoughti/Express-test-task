const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const { User, validateUser } = require("../models/user.model");
const ApiHelper = require("../utils/api.helper");
const isValidUsername = require("../validator/username.validator");

router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password").select("-tokens");

    if (users.length === 0) {
      ApiHelper.generateApiResponse(res, req, "No users found", 404);
      return;
    }

    ApiHelper.generateApiResponse(
      res,
      req,
      "Users fetched successfully",
      200,
      users
    );
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, error.message, 500);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0, tokens: 0 });

    if (user === null) {
      ApiHelper.generateApiResponse(res, req, "User not found", 400);
      return;
    }

    ApiHelper.generateApiResponse(res, req, "User found", 200, user);
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Invalid user id", 404);
  }
});

router.post("/", async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      ApiHelper.generateApiResponse(res, req, "All fields required.", 400);
      return;
    }

    const { error, value } = validateUser(req.body);

    console.log(error);

    if (error) {
      ApiHelper.generateApiResponse(res, req, error.message, 400);
      return;
    }

    const { email, username } = value;

    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingEmail || existingUsername) {
      ApiHelper.generateApiResponse(res, req, "User already exist", 409);
      return;
    }

    if (!isValidUsername(req.body.username)) {
      ApiHelper.generateApiResponse(res, req, "Invalid username", 400);
      return;
    }

    const user = await User.create(req.body);
    ApiHelper.generateApiResponse(res, req, "User created successfully", 201);
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, error.message, 500);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0, tokens: 0 });
    const existingEmail = await User.findOne({ email: req.body.email });
    const existingUsername = await User.findOne({
      username: req.body.username,
    });

    if (!user) {
      ApiHelper.generateApiResponse(res, req, "User not found", 400);
      return;
    }

    if (existingEmail || existingUsername) {
      ApiHelper.generateApiResponse(
        res,
        req,
        "email or username already exists.",
        400
      );
      return;
    }

    if (req.body.password) {
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);
      req.body.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    if (!isValidUsername(updatedUser.username)) {
      ApiHelper.generateApiResponse(res, req, "Invalid username", 400);
      return;
    }

    ApiHelper.generateApiResponse(res, req, "User updated successfully", 200);
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Invalid user id", 500);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const existingEmail = await User.findOne({ email: req.body.email });
    const existingUsername = await User.findOne({
      username: req.body.username,
    });

    if (!user) {
      ApiHelper.generateApiResponse(res, req, "User not found", 400);
      return;
    }

    if (existingEmail || existingUsername) {
      ApiHelper.generateApiResponse(
        res,
        req,
        "email or username already exists.",
        400
      );
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    ApiHelper.generateApiResponse(res, req, "User updated successfully", 200);
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Invalid user id", 500);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      ApiHelper.generateApiResponse(res, req, "User not found", 400);
      return;
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    ApiHelper.generateApiResponse(res, req, "User deleted successfully", 200);
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Invalid user id", 500);
  }
});

module.exports = router;
