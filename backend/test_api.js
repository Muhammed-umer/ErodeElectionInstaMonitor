const axios = require('axios');
require('dotenv').config({ path: '.env' });

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const HF_KEY = process.env.HUGGINGFACE_API_KEY;

async function runDiagnostics() {
  console.log("=== IG GRAPH API TEST ===");
  try {
    const res = await axios.get(`https://graph.facebook.com/v18.0/ig_hashtag_search`, {
      params: { user_id: IG_USER_ID, q: "erode", access_token: IG_ACCESS_TOKEN }
    });
    console.log("IG Success!");
    console.log(res.data);
  } catch (err) {
    console.error("IG Error FULL JSON:\n", JSON.stringify(err.response ? err.response.data : err.message, null, 2));
  }

  console.log("\n=== HUGGING FACE API TEST ===");
  try {
    const res = await axios.post(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      { inputs: "I love this so much" },
      { headers: { Authorization: `Bearer ${HF_KEY}` } }
    );
    console.log("HF Success!");
    console.log(res.data);
  } catch (err) {
    console.error("HF Error:", err.response ? err.response.data : err.message);
  }
}

runDiagnostics();
