const jwt = require("jsonwebtoken");

const ApiHelper = require("../utils/api.helper");

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, user) {
      if (err) return reject(err);
      resolve(user);
    });
  });
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
  }
 
  req.user = user;
  next();
};
