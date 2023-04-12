const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const validator = require("../validator/schema.validator");

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true, minLength: 10 },
  username: { type: String, required: true },
  user_type: { type: String, enum: ["admin", "user"], required: true },
  password: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], required: true },
  tokens: [{ type: Object }],
});

const joiUserSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().length(10).required(),
  username: Joi.string().required(),
  user_type: Joi.string().valid("admin", "user").required(),
  password: Joi.string().required(),
  status: Joi.string().valid("active", "inactive").required(),
  tokens: Joi.array().items(Joi.object()),
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  return next();
});

userSchema.methods.checkPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("user", userSchema);

const validateUser = validator(joiUserSchema);

module.exports = { User, validateUser };
