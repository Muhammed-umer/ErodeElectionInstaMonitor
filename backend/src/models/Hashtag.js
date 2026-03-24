const mongoose = require("mongoose");

const hashtagSchema = mongoose.Schema({
  keyword: { type: String, required: true, unique: true },
  igHashtagId: { type: String }, // Fetched from Instagram Graph API
  createdAt: { type: Date, default: Date.now }
});

// Calculate if limit of 30 unique hashtags per 7 days is reached
hashtagSchema.statics.canAddHashtag = async function() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const count = await this.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  return count < 30; // Max 30 unique hashtags per 7 days
};

module.exports = mongoose.model("Hashtag", hashtagSchema);
