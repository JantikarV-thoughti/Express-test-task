const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const validator = require("../validator/schema.validator");

const authSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: Number, required: true },
    password: { type: String, required: true },
    tokens: [{type: Object}]
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const joiAuthSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile: Joi.number().min(10).required(),
  password: Joi.string().required(),
});

authSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  return next();
});

authSchema.methods.checkPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const validateAuth = validator(joiAuthSchema);

const Auth = mongoose.model("auth", authSchema);

module.exports = { Auth, validateAuth };
