const mongoose = require("mongoose");
const Joigoose = require("joigoose")(mongoose);

const Joi = require("joi");

const joiUserSchema = Joi.object({
  id: Joi.number().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().min(3).max(8).required(),
  status: Joi.boolean().required(),
});

const validator = (schema) => (payload) =>
  schema.validate(payload, { abortEarly: true });

const mongooseUserSchema = new mongoose.Schema(Joigoose.convert(joiUserSchema));

const User = mongoose.model("user", mongooseUserSchema);

const validateUser = validator(joiUserSchema);

module.exports = { User, validateUser };
