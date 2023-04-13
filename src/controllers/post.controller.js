const express = require("express");
const router = express.Router();

const { Post, validatePost } = require("../models/post.model.js");
const ApiHelper = require("../utils/api.helper");
const authenticate = require("../middlewares/authenticate.middleware.js");

router.get("/", authenticate, async (req, res) => {
  try {
    let posts = await Post.find().populate("user_id");
    if (posts.length === 0) {
      ApiHelper.generateApiResponse(res, req, "No posts found", 404);
      return;
    }

    ApiHelper.generateApiResponse(
      res,
      req,
      "Posts fetched successfully",
      200,
      posts
    );
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Cannot find posts", 500);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      ApiHelper.generateApiResponse(res, req, "Post not found", 400);
      return;
    }

    ApiHelper.generateApiResponse(res, req, "Post found", 200, post);
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Post not found", 500);
  }
});

router.post("/", async (req, res) => {
  try {
    const { error } = validatePost(req.body);

    if (error) {
      ApiHelper.generateApiResponse(res, req, error.message, 400);
      return;
    }

    const existingPost = await Post.findOne({ title: req.body.title });

    if (existingPost) {
      ApiHelper.generateApiResponse(
        res,
        req,
        "The post with this title already exists.",
        409
      );
      return;
    }

    const post = await Post.create(req.body);

    ApiHelper.generateApiResponse(
      res,
      req,
      "Post created successfully",
      201,
      post
    );
  } catch (error) {
    ApiHelper.generateApiResponse(
      res,
      req,
      "Could not create post. Please try again later.",
      500
    );
  }
});

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      ApiHelper.generateApiResponse(res, req, "Post not found", 400);
      return;
    }

    const existingPost = await Post.findOne({ title: req.body.title });

    if (existingPost) {
      ApiHelper.generateApiResponse(
        res,
        req,
        "The post with this title already exists.",
        409
      );
      return;
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    ApiHelper.generateApiResponse(
      res,
      req,
      "Post updated successfully",
      201,
      updatedPost
    );
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Invalid post Id", 500);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      ApiHelper.generateApiResponse(res, req, "Post not found", 400);
      return;
    }

    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    ApiHelper.generateApiResponse(
      res,
      req,
      "Post has been successfully deleted",
      200
    );
  } catch (error) {
    ApiHelper.generateApiResponse(res, req, "Could not delete post", 500);
  }
});

module.exports = router;
