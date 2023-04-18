const { ApiHelper, JwtHelper } = require("../utils");
const { User } = require("../models/user.model");

const verifyToken = async (token) => {
    try {
        const decoded = await JwtHelper.verify(token);

        const existingUser = await User.findOne({ _id: decoded.user_id });

        if (existingUser.token !== token) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "User not found",
                400
            );
        }

        return decoded;
    } catch (error) {
        return ApiHelper.generateApiResponse(res, req, "Invalid token", 500);
    }
};

module.exports = async (req, res, next) => {
    if (!req.headers?.authorization) {
        return ApiHelper.generateApiResponse(
            res,
            req,
            "Please provide a valid authorization token",
            401
        );
    }

    const bearerToken = req.headers.authorization;

    if (!bearerToken.startsWith("Bearer ")) {
        return ApiHelper.generateApiResponse(
            res,
            req,
            "Please provide a valid authorization token",
            401
        );
    }

    const token = bearerToken.split(" ")[1];

    let user;
    try {
        user = await verifyToken(token);
    } catch (err) {
        return ApiHelper.generateApiResponse(
            res,
            req,
            "The token is not valid",
            401
        );
    }

    req.user = user;
    next();
};
