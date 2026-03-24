const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    caption: { type: String, required: true },
    hashtags: { type: [String], default: [] },
    timestamp: { type: Date, default: Date.now },
    sentiment: { type: String, enum: ["Positive", "Negative", "Neutral"], default: "Neutral" },
    mediaType: { type: String, enum: ["Post", "Reel"], required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
