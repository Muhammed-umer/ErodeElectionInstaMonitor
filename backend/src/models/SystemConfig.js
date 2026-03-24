const mongoose = require("mongoose");

const configSchema = mongoose.Schema({
  selectedModel: { 
    type: String, 
    enum: ["distilbert", "roberta", "bertweet"],
    default: "distilbert" 
  },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SystemConfig", configSchema);
