const axios = require("axios");
const SystemConfig = require("../models/SystemConfig");

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

const MODEL_URLS = {
  distilbert: "https://router.huggingface.co/hf-inference/models/distilbert-base-uncased-finetuned-sst-2-english",
  roberta: "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment",
  bertweet: "https://router.huggingface.co/hf-inference/models/finiteautomata/bertweet-base-sentiment-analysis"
};

async function getSelectedModelUrl() {
  const config = await SystemConfig.findOne();
  if (config && MODEL_URLS[config.selectedModel]) {
    return { url: MODEL_URLS[config.selectedModel], type: config.selectedModel };
  }
  return { url: MODEL_URLS.distilbert, type: "distilbert" }; // Default
}

// HuggingFace Sentiment Logic
async function analyzeSentiment(text) {
  if (!HUGGINGFACE_API_KEY) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('good') || lowerText.includes('great') || lowerText.includes('awesome') || lowerText.includes('support')) return "Positive";
    if (lowerText.includes('bad') || lowerText.includes('terrible') || lowerText.includes('hate') || lowerText.includes('fake')) return "Negative";
    return "Neutral";
  }

  try {
    const { url, type } = await getSelectedModelUrl();
    const response = await axios.post(
      url,
      { inputs: text },
      { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
    );

    // Each model returns different label formats.
    // E.g., DistilBERT: "POSITIVE", "NEGATIVE"
    // RoBERTa: "LABEL_2" (pos), "LABEL_0" (neg) etc.
    const result = response.data[0][0];
    const label = result.label.toUpperCase();

    if (label.includes("POS") || label === "LABEL_2") {
      return "Positive";
    } else if (label.includes("NEG") || label === "LABEL_0") {
      return "Negative";
    }
    return "Neutral";
  } catch (error) {
    console.error("Sentiment analysis error:", error.message);
    return "Neutral"; // Fallback
  }
}

module.exports = { analyzeSentiment, getSelectedModelUrl };
