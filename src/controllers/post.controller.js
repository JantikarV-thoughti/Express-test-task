const express = require("express");
const router = express.Router();

const { Post, validatePost } = require("../models/post.model.js");
const ApiHelper = require("../utils/api.helper");
const authenticate = require("../middlewares/authenticate.middleware.js");

router.get("/", authenticate, async (req, res) => {
    try {
        let posts = await Post.find();
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
        ApiHelper.generateApiResponse(
            res,
            req,
            "Somethimg went wrong while getting all posts.",
            500
        );
    }
});

router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            ApiHelper.generateApiResponse(res, req, "Post not found", 404);
            return;
        }

        ApiHelper.generateApiResponse(res, req, "Post found", 200, post);
    } catch (error) {
        ApiHelper.generateApiResponse(
            res,
            req,
            "Something went wrong, could not find post.",
            500
        );
    }
});

router.post("/", async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "All fields required.",
                400
            );
            return;
        }
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
                "The post with smae title already exist.",
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
            "Something went wrong, please try again later.",
            500
        );
    }
});

router.put("/:id", async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "Inputs can not be empty.",
                400
            );
            return;
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            ApiHelper.generateApiResponse(res, req, "Post not found", 404);
            return;
        }

        const fieldNames = [
            "title",
            "description",
            "is_published",
            "status",
            "user_id",
        ];

        let count = 0;

        for (let key in req.body) {
            for (let i = 0; i < fieldNames.length; i++) {
                if (key === fieldNames[i]) {
                    count++;
                }
            }
        }

        if (count === 0) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "Invalid field name entered",
                400
            );
            return;
        }

        const existingPost = await Post.findOne({
            $and: [{ title: req.body.title }, { _id: { $ne: req.params.id } }],
        });

        if (existingPost) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "The post with same title already exists.",
                409
            );
            return;
        }

        if (req.body.status) {
            if (
                req.body.status !== "active" ||
                req.body.status !== "inactive"
            ) {
                ApiHelper.generateApiResponse(
                    res,
                    req,
                    "Status must be either active or inactive.",
                    400
                );
                return;
            }
        }

        if (req.body.status == false) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "Status must be either active or inactive",
                400
            );
            return;
        }

        if (req.body.is_published) {
            if (typeof req.body.is_published !== "boolean") {
                ApiHelper.generateApiResponse(
                    res,
                    req,
                    "Please provide valid value for is_published, it is either true or false",
                    400
                );
                return;
            }
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );

        ApiHelper.generateApiResponse(
            res,
            req,
            "Post updated successfully",
            200,
            updatedPost
        );
    } catch (error) {
        ApiHelper.generateApiResponse(res, req, "Something went wrong.", 500);
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            ApiHelper.generateApiResponse(res, req, "Post not found", 404);
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
        console.log(error);
        ApiHelper.generateApiResponse(
            res,
            req,
            "Something went wrong, while deleting the post.",
            500
        );
    }
});

module.exports = router;
