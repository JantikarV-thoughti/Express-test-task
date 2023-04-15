const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY =
    process.env.JWT_SECRET_KEY || "tyuujnhjgfvbnkajadhadhhdahduiu";
const JWT_TOKEN_EXPIRY = process.env.JWT_TOKEN_EXPIRY || "1d";

const newToken = (user) => {
    return jwt.sign({ user_id: user._id }, JWT_SECRET_KEY, {
        expiresIn: JWT_TOKEN_EXPIRY,
    });
};

module.exports = newToken;
