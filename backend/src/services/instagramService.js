const axios = require("axios");
const Bottleneck = require("bottleneck");
const Hashtag = require("../models/Hashtag");
const Post = require("../models/Post");
const { analyzeSentiment } = require("./sentimentService");

// Approx 200 API calls per hour per account -> roughly 3.3 per minute.
// We set limits to 3 requests per minute max to be safe.
const limiter = new Bottleneck({
  minTime: 20000, // 20 seconds between requests
  maxConcurrent: 1,
});

const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID; 

// Retrieve or Search Hashtag ID
async function getHashtagId(keyword) {
  keyword = keyword.replace("#", "").toLowerCase();
  
  // 1. Check local DB
  let hashtagDoc = await Hashtag.findOne({ keyword });
  if (hashtagDoc) return hashtagDoc.igHashtagId;

  // 2. Not in DB - Enforce the 30 hashtags per 7 days limit
  const canAdd = await Hashtag.canAddHashtag();
  if (!canAdd) {
    throw new Error("Hashtag limit reached (30 unique per 7 days). Cannot search new hashtag: " + keyword);
  }

  // 3. Rate-limited API Call to find IG Hashtag ID
  const response = await limiter.schedule(() =>
    axios.get(`https://graph.facebook.com/v18.0/ig_hashtag_search`, {
      params: { user_id: IG_USER_ID, q: keyword, access_token: ACCESS_TOKEN }
    })
  );

  const igHashtagId = response.data.data[0].id;

  // 4. Save to DB
  hashtagDoc = new Hashtag({ keyword, igHashtagId });
  await hashtagDoc.save();

  return igHashtagId;
}

// Fetch and Analyze Recent Media for a given Hashtag
async function fetchRecentMedia(keyword) {
  try {
    const igHashtagId = await getHashtagId(keyword);

    // Rate-limited API Call to fetch recent media
    const response = await limiter.schedule(() =>
      axios.get(`https://graph.facebook.com/v18.0/${igHashtagId}/recent_media`, {
        params: {
          user_id: IG_USER_ID,
          fields: "id,caption,media_type,timestamp,username",
          access_token: ACCESS_TOKEN,
          limit: 25
        }
      })
    );

    const posts = response.data.data;
    if (!posts || posts.length === 0) return [];

    const newPosts = [];

    // Process posts and Analyze Sentiment
    for (const p of posts) {
      if (!p.caption) continue;

      // Extract typical hashtags from caption to assist search filters
      const postHashtags = p.caption.match(/#[a-z0-9_]+/gi) || [];

      // Pass caption to Sentiment Analysis (uses appropriate HuggingFace model dynamically)
      const sentiment = await analyzeSentiment(p.caption);

      // Check if already in DB based on unique IG ID or unique caption matching to avoid duplication
      // In a real app we would map IG Post 'id' directly inside our Post Schema to avoid dupes:
      const existing = await Post.findOne({ caption: p.caption, timestamp: p.timestamp });
      if (!existing) {
        const postDoc = await Post.create({
          username: p.username || "unknown", // Graph API might restrict username based on privacy
          caption: p.caption,
          hashtags: postHashtags,
          timestamp: p.timestamp,
          sentiment: sentiment,
          mediaType: p.media_type === "VIDEO" ? "Reel" : "Post"
        });
        newPosts.push(postDoc);
        
        // ALERTS SYSTEM IMPL:
        // We can emit sockets/events here if 'sentiment === Negative' matches threshold criteria
      }
    }

    return newPosts;

  } catch (err) {
    console.error(`Error in fetchRecentMedia for ${keyword}:`, err.message);
    return [];
  }
}

module.exports = {
  fetchRecentMedia,
  getHashtagId
};
