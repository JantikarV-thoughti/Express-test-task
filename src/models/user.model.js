const mongoose = require("mongoose");
const Joigoose = require("joigoose")(mongoose);

const Joi = require("joi");
const validator = require("../validator/schema.validator");

const joiUserSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "org"] },
    })
    .required(),
  username: Joi.string().required(),
  password: Joi.string().min(3).max(8).required(),
  status: Joi.boolean().required(),
});

const mongooseUserSchema = new mongoose.Schema(Joigoose.convert(joiUserSchema));

const User = mongoose.model("user", mongooseUserSchema);

const validateUser = validator(joiUserSchema);

module.exports = { User, validateUser };
