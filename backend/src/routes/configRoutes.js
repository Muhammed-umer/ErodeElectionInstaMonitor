const express = require("express");
const router = express.Router();
const SystemConfig = require("../models/SystemConfig");

// 4. MODEL SWITCHING SYSTEM logic
router.put("/model", async (req, res) => {
  const { modelName } = req.body;
  if (!["distilbert", "roberta", "bertweet"].includes(modelName)) {
    return res.status(400).json({ error: "Invalid model selection." });
  }
  
  // Update Config table with new selected Model dynamically
  let config = await SystemConfig.findOne();
  if (!config) {
    config = new SystemConfig();
  }
  
  config.selectedModel = modelName;
  await config.save();
  
  return res.json({ message: "Model switched successfully applied to new incoming data.", selectedModel: config.selectedModel });
});

router.get("/model", async (req, res) => {
  const config = await SystemConfig.findOne();
  res.json({ selectedModel: config ? config.selectedModel : "distilbert" });
});

module.exports = router;
