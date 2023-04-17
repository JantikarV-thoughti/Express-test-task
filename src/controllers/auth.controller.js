const express = require("express");

const router = express.Router();
const { User, validateUser } = require("../models/user.model");
const authenticate = require("../middlewares/authenticate.middleware.js");
const isValidUsername = require("../validator/username.validator");
const { ApiHelper, JwtHelper } = require("../utils");

router.post("/register", async (req, res) => {
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

        const { error } = validateUser(req.body);

        if (error) {
            ApiHelper.generateApiResponse(res, req, error.message, 400);
            return;
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "User with same email already exist",
                409
            );
            return;
        }

        const existingUsername = await User.findOne({
            username: req.body.username,
        });
        if (existingUsername) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "User with same username already exist",
                409
            );
            return;
        }

        if (!isValidUsername(req.body.username)) {
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

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
            .select("password")
            .select("status");

        if (!user) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "Invalid email, please enter the correct email.",
                401
            );
            return;
        }

        const match = user.checkPassword(req.body.password);

        if (!match) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "Invalid password, please enter the correct password.",
                401
            );
            return;
        }

        if (user.status === "inactive") {
            ApiHelper.generateApiResponse(
                res,
                req,
                "Inactive user; User disabled",
                401
            );
            return;
        }

        // const token = newToken(user);

        let payload = { user_id: user._id };
        const token = await JwtHelper.sign(payload);

        let oldTokens = user.tokens || [];

        if (oldTokens.length) {
            oldTokens = oldTokens.filter((item) => {
                const timeDiff = (Date.now() - parseInt(item.signedAt)) / 1000;
                if (timeDiff < 86400) {
                    return item;
                }
            });
        }

        await User.findByIdAndUpdate(user._id, {
            tokens: [{ token, signedAt: Date.now().toString() }],
        });

        ApiHelper.generateApiResponse(
            res,
            req,
            "User logged in successfully.",
            200,
            { token: token }
        );
    } catch (error) {
        ApiHelper.generateApiResponse(
            res,
            req,
            "Something went wrong, please try again",
            500
        );
    }
});

router.post("/logout", authenticate, async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const token = req.headers?.authorization.split(" ")[1];

            if (!token) {
                ApiHelper.generateApiResponse(
                    res,
                    req,
                    "Authorization fail",
                    401
                );
                return;
            }

            const user = await User.findById(req.user.user_id);

            const tokens = user.tokens;

            const newToken = tokens.filter((item) => item.token !== token);

            await User.findByIdAndUpdate(req.user.user_id, {
                tokens: newToken,
            });
            ApiHelper.generateApiResponse(
                res,
                req,
                "Logged out successfully",
                200
            );
        }
    } catch (error) {
        ApiHelper.generateApiResponse(res, req, "Something went wrong", 500);
    }
});

module.exports = router;
