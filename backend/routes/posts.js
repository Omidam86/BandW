const express = require("express");
const {
  getPosts,
  getPostById,
  createPost,
  getPendingPosts,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const router = express.Router();

router.get("/", getPosts);
router.post("/", createPost);
router.get("/:id", getPostById);

router.get("/pending", getPendingPosts);
router.patch("/:id", updatePost);
router.delete("/:id", deletePost);

module.exports = router;
