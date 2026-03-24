const express = require("express");
const router = express.Router();
const { getPosts, searchPosts } = require("../controllers/postController");

router.get("/", getPosts);
router.get("/search", searchPosts);

module.exports = router;
