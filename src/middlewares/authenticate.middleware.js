const jwt = require("jsonwebtoken");

const ApiHelper = require("../utils/api.helper");
const { User } = require("../models/user.model");

const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const existingUser = await User.findOne({ _id: decoded.user_id });

    if (existingUser.tokens[0].token !== token) {
      ApiHelper.generateApiResponse(res, req, "User not found", 400);
      return;
    }

    return decoded;
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Invalid token", 500);
    return;
  }
};

module.exports = async (req, res, next) => {
  if (!req.headers?.authorization) {
    ApiHelper.generateApiResponse(
      res,
      req,
      "Please provide a valid authorization token",
      400
    );
    return;
  }

  const bearerToken = req.headers.authorization;

  if (!bearerToken.startsWith("Bearer ")) {
    ApiHelper.generateApiResponse(
      res,
      req,
      "Please provide a valid authorization token",
      400
    );
    return;
  }

  const token = bearerToken.split(" ")[1];

  let user;
  try {
    user = await verifyToken(token);
  } catch (err) {
    ApiHelper.generateApiResponse(res, req, "The token is not valid", 401);
    return;
  }

  req.user = user;
  next();
};
