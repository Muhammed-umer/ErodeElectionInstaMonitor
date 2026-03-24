const { exec } = require("child_process");
const path = require("path");
const Hashtag = require("../models/Hashtag");
const Post = require("../models/Post");
const { analyzeSentiment } = require("./sentimentService");

async function fetchRecentMedia(keyword) {
  try {
    const cleanKeyword = keyword.replace("#", "").toLowerCase();
    
    // 1. Enforce Hashtag limits in MongoDB
    let hashtagDoc = await Hashtag.findOne({ keyword: cleanKeyword });
    if (!hashtagDoc) {
      const canAdd = await Hashtag.canAddHashtag();
      if (!canAdd) throw new Error("Hashtag limit reached (30 unique per 7 days).");
      hashtagDoc = new Hashtag({ keyword: cleanKeyword, igHashtagId: cleanKeyword });
      await hashtagDoc.save();
    }

    // 2. Execute the Python Instaloader script
    const posts = await new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, "../../scraper.py");
      
      // Pass the Node environment variables (which include .env vars loaded globally) to Python
      exec(`python "${scriptPath}" ${cleanKeyword}`, { env: process.env }, (error, stdout, stderr) => {
        if (error) {
          console.error("Python scraper error:", stderr || error.message);
          resolve([]);
        } else {
          try {
            // Strip any prefix logs Instaloader might throw to stdout to find JSON array
            const jsonStart = stdout.indexOf('[');
            if(jsonStart === -1) {
              const errStart = stdout.indexOf('{');
              if(errStart !== -1) {
                const errData = JSON.parse(stdout.substring(errStart));
                console.error("Instaloader returned error:", errData.error);
              }
              resolve([]);
              return;
            }
            const jsonStr = stdout.substring(jsonStart);
            const data = JSON.parse(jsonStr);
            resolve(data);
          } catch (e) {
            console.error("Failed to parse scraper output:", e);
            resolve([]);
          }
        }
      });
    });

    if (!posts || posts.length === 0) return [];

    const newPosts = [];
    // 3. Process, Analyze Sentiment, and Save to MongoDB
    for (const p of posts) {
      if (!p.caption) continue;

      const postHashtags = p.caption.match(/#[a-z0-9_]+/gi) || [];
      const sentiment = await analyzeSentiment(p.caption);

      const existing = await Post.findOne({ caption: p.caption, timestamp: p.timestamp });
      if (!existing) {
        const postDoc = await Post.create({
          username: p.username || "unknown",
          caption: p.caption,
          hashtags: postHashtags,
          timestamp: p.timestamp,
          sentiment: sentiment,
          mediaType: p.media_type === "VIDEO" ? "Reel" : "Post"
        });
        newPosts.push(postDoc);
      }
    }

    return newPosts;

  } catch (err) {
    console.error(`Error in fetchRecentMedia for ${keyword}:`, err.message);
    return [];
  }
}

// Ensure getHashtagId is strictly mocked for backwards compatibility if needed
module.exports = {
  fetchRecentMedia,
  getHashtagId: async (kw) => kw
};
