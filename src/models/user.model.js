const mongoose = require("mongoose");
const Joigoose = require("joigoose")(mongoose);

const Joi = require("joi");

// const userSchema = new mongoose.Schema(
//   {
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },
//     email: {type: String, required: true},
//     username: {type: String, required: true},
//     password: {type: String, required: true},
//     status: {type: Boolean, required: true}
//   },
//   {
//     versionKey: false,
//     timestamps: true,
//   }
// );

const joiUserSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().min(3).max(8).required(),
  status: Joi.boolean().required(),
});

const validator = (schema) => (payload) => schema.validate(payload, {abortEarly: true});

const mongooseUserSchema = new mongoose.Schema(Joigoose.convert(joiUserSchema));

const User =  mongoose.model("user", mongooseUserSchema);

const validateUser = validator(joiUserSchema)

module.exports = {User, validateUser}
