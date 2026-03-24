const cron = require("node-cron");
const Hashtag = require("../models/Hashtag");
const Post = require("../models/Post");
const { fetchRecentMedia } = require("./instagramService");

// Continuously fetch Instagram data every 5 minutes
cron.schedule("*/5 * * * *", async () => {
    console.log("Running background continuous monitoring job...");
    
    try {
        // Fetch all previously stored active hashtags limit: 30
        const storedHashtags = await Hashtag.find({}).limit(30);

        for (const tag of storedHashtags) {
            console.log(`Fetching recent media for hashtag: ${tag.keyword}`);
            // Service handles 200 API rate limit globally & performs Sentiment Analysis dynamically!
            const newPosts = await fetchRecentMedia(tag.keyword);
            
            // 6. ALERT SYSTEM Implementation Check 
            let negativeCount = 0;
            for (let post of newPosts) {
                if(post.sentiment === "Negative") negativeCount++;
            }
            
            // Simple threshold: alert if new fetch returns > 5 negative posts
            if (negativeCount >= 5) {
                console.warn(`[ALERT] Spike in negative posts detected for #${tag.keyword}: ${negativeCount} negatives.`);
                // Here emitting WebSocket event for Dashboard Real-time alert.
            }
        }
    } catch (error) {
        console.error("Scheduler encountered an error: " + error.message);
    }
});

console.log("Background Monitoring Scheduler initialized: Every 5 minutes.");
module.exports = cron;
