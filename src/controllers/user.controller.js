const express = require("express");
const router = express.Router();

const { User, validateUser } = require("../models/user.model");
const ApiHelper = require("../utils/api.helper");

router.get("/", async (req, res) => {
  try {
    const users = await User.find();

    if (users.length === 0) {
      ApiHelper.generateApiResponse(res, req, "No users", 200);
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
    const user = await User.findById(req.params.id);
    ApiHelper.generateApiResponse(res, req, "User found", 200, user);
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Invalid user id", 404);
  }
});

router.post("/", async (req, res) => {
  try {
    const { error, value } = validateUser(req.body);

    if (error) {
      console.log(error);
      return res.send(error.details);
    }

    const { email } = value;

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      //  return res.status(500).send("User already exist")
      ApiHelper.generateApiResponse(res, req, "User already exist", 500);
      return;
    }

    const user = await User.create(req.body);
    ApiHelper.generateApiResponse(
      res,
      req,
      "User created successfully",
      201,
      user
    );
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, error.message, 500);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    ApiHelper.generateApiResponse(
      res,
      req,
      "User updated successfully",
      201,
      updatedUser
    );
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Invalid user id", 400);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    ApiHelper.generateApiResponse(
      res,
      req,
      "User updated successfully",
      201,
      updatedUser
    );
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Invalid user id", 400);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    ApiHelper.generateApiResponse(
      res,
      req,
      "User deleted successfully",
      200,
      deletedUser
    );
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Invalid user id", 500);
  }
});

module.exports = router;
