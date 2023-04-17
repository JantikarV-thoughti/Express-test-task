const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const { User, validateUser } = require("../models/user.model");
const ApiHelper = require("../utils/api.helper");
const { usernameValidator } = require("../validator");

router.get("/", async (req, res) => {
    try {
        const { search, status, user_type } = req.query;

        const query = {};

        if (search && search.length < 3) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "Search length must be more than 3 characters",
                400
            );
        }

        if (search) {
            query.$or = [
                { first_name: { $regex: search, $options: "i" } },
                { last_name: { $regex: search, $options: "i" } },
                { mobile: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } },
            ];
        }

        if (status) {
            query.status = status;
        }

        if (user_type) {
            query.user_type = user_type;
        }

        const users = await User.find(query)
            .select("-password")
            .select("-tokens");

        if (users.length === 0) {
            ApiHelper.generateApiResponse(res, req, "No users found", 404);
            return;
        }

        ApiHelper.generateApiResponse(
            res,
            req,
            "Users fetched successfully",
            200,
            {
                count: users.length,
                rows: users,
            }
        );
    } catch (error) {
        console.log(error);
        ApiHelper.generateApiResponse(
            res,
            req,
            "Something went wrong, while getting all users",
            500
        );
    }
});

router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id, {
            password: 0,
            tokens: 0,
        });

        if (user === null) {
            ApiHelper.generateApiResponse(res, req, "User not found", 404);
            return;
        }

        ApiHelper.generateApiResponse(res, req, "User found", 200, user);
    } catch (error) {
        ApiHelper.generateApiResponse(
            res,
            req,
            "Something went wrong while getting user",
            500
        );
    }
});

router.post("/", async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "All fields required.",
                400
            );
            return;
        }

        const { error, value } = validateUser(req.body);

        if (error) {
            ApiHelper.generateApiResponse(res, req, error.message, 400);
            return;
        }

        const { email, username } = value;

        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "User with same email already exist",
                409
            );
            return;
        }

        const existingUsername = await User.findOne({ username });

        if (existingUsername) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "User with same username already exist",
                409
            );
            return;
        }

        if (!usernameValidator(req.body.username)) {
            ApiHelper.generateApiResponse(res, req, "Invalid username", 400);
            return;
        }

        let user = await User.create(req.body);

        user = await User.findOne(
            { email: req.body.email },
            { password: 0, tokens: 0 }
        );

        ApiHelper.generateApiResponse(
            res,
            req,
            "User registered successfully",
            201,
            user
        );
    } catch (error) {
        ApiHelper.generateApiResponse(
            res,
            req,
            "Something went wrong while registering.",
            500
        );
    }
});

router.put("/:id", async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "Inputs can not be empty.",
                400
            );
            return;
        }

        const user = await User.findById(req.params.id, {
            password: 0,
            tokens: 0,
        });

        if (!user) {
            ApiHelper.generateApiResponse(res, req, "User not found", 404);
            return;
        }

        const fieldNames = [
            "first_name",
            "last_name",
            "email",
            "mobile",
            "username",
            "user_type",
            "password",
            "status",
        ];

        let count = 0;

        for (let key in req.body) {
            for (let i = 0; i < fieldNames.length; i++) {
                if (key === fieldNames[i]) {
                    count++;
                }
            }
        }

        if (count === 0) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "Invalid field name entered",
                400
            );
            return;
        }

        const existingEmail = await User.findOne({
            $and: [{ email: req.body.email }, { _id: { $ne: req.params.id } }],
        });

        if (existingEmail) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "User with the same email already exist.",
                409
            );
            return;
        }

        const existingUsername = await User.findOne({
            $and: [
                { username: req.body.username },
                { _id: { $ne: req.params.id } },
            ],
        });

        if (existingUsername) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "User with the same username already exist.",
                409
            );
            return;
        }

        if (req.body.user_type) {
            if (
                req.body.user_type !== "user" ||
                req.body.user_type !== "admin"
            ) {
                ApiHelper.generateApiResponse(
                    res,
                    req,
                    "User type must be either user or admin.",
                    400
                );
                return;
            }
        }

        if (req.body.status) {
            if (
                req.body.status !== "active" ||
                req.body.status !== "inactive"
            ) {
                ApiHelper.generateApiResponse(
                    res,
                    req,
                    "Status must be either active or inactive.",
                    400
                );
                return;
            }
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

        if (!usernameValidator(updatedUser.username)) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "Invalid username, shoud not contain space.",
                400
            );
            return;
        }

        ApiHelper.generateApiResponse(
            res,
            req,
            "User updated successfully",
            200
        );
    } catch (error) {
        ApiHelper.generateApiResponse(
            res,
            req,
            "Something went wrong, while updating.",
            500
        );
    }
});

router.patch("/:id", async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "Inputs can not be empty.",
                400
            );
            return;
        }
        const user = await User.findById(req.params.id);

        if (!user) {
            ApiHelper.generateApiResponse(res, req, "User not found", 404);
            return;
        }

        const fieldNames = [
            "first_name",
            "last_name",
            "email",
            "mobile",
            "username",
            "user_type",
            "password",
            "status",
        ];

        let count = 0;

        for (let key in req.body) {
            for (let i = 0; i < fieldNames.length; i++) {
                if (key === fieldNames[i]) {
                    count++;
                }
            }
        }

        if (count === 0) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "Invalid field name entered",
                400
            );
            return;
        }

        const existingEmail = await User.findOne({
            $and: [{ email: req.body.email }, { _id: { $ne: req.params.id } }],
        });

        if (existingEmail) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "User with the same email already exist.",
                409
            );
            return;
        }

        const existingUsername = await User.findOne({
            $and: [
                { username: req.body.username },
                { _id: { $ne: req.params.id } },
            ],
        });

        if (existingUsername) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "User with the same username already exist.",
                409
            );
            return;
        }

        const updatedUser = await User.findByIdAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        );

        if (!usernameValidator(updatedUser.username)) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "Invalid username, shoud not contain space.",
                400
            );
            return;
        }

        ApiHelper.generateApiResponse(
            res,
            req,
            "User updated successfully",
            200
        );
    } catch (error) {
        ApiHelper.generateApiResponse(res, req, "Something went wrong.", 500);
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            ApiHelper.generateApiResponse(res, req, "User not found.", 404);
            return;
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id);
        ApiHelper.generateApiResponse(
            res,
            req,
            "User deleted successfully.",
            200
        );
    } catch (error) {
        ApiHelper.generateApiResponse(res, req, "Something went wrong.", 500);
    }
});

module.exports = router;
