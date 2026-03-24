const Post = require("../models/Post");

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query string is required" });

    const keywords = q.split(",").map((kw) => kw.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regexPattern = keywords.join("|");

    const posts = await Post.find({
      $or: [
        { caption: { $regex: regexPattern, $options: "i" } },
        { hashtags: { $in: keywords.map(kw => new RegExp(kw, 'i')) } }
      ]
    }).sort({ timestamp: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getPosts, searchPosts };
