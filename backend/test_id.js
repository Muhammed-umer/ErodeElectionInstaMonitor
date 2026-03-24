const axios = require('axios');
require('dotenv').config({ path: '.env' });

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = "2178894736188225";

async function testId() {
  try {
    const res = await axios.get(`https://graph.facebook.com/v18.0/ig_hashtag_search`, {
      params: { user_id: IG_USER_ID, q: "erode", access_token: IG_ACCESS_TOKEN }
    });
    console.log("SUCCESS! This is the correct IG_USER_ID.");
    console.log(res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

testId();
