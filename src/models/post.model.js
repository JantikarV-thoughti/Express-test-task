const mongoose = require("mongoose");
const Joi = require("joi");
const validator = require("../validator/schema.validator");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    is_published: { type: Boolean, required: true },
    status: { type: Boolean, required: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const joiPostSchema = Joi.object({
  title: Joi.string().min(5).max(50).required(),
  description: Joi.string().min(10).required(),
  is_published: Joi.boolean().required(),
  status: Joi.boolean().required(),
  user_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
});

const validatePost = validator(joiPostSchema);

const Post = mongoose.model("post", postSchema);

module.exports = { Post, validatePost };
