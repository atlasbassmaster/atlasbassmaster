import express from "express";
import State from "../models/State.js";

const router = express.Router();

router.get('/', async (req, res) => {

  try {
    const featureState = await State.findOne();
    if (!featureState) {
      return res.status(404).json({ error: 'Feature not found' });
    }
    res.json({ enabled: featureState.enabled });
  } catch (error) {
    console.error('Error fetching feature state:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle a feature on/off
router.put("/toggle", async (req, res) => {
  try {
    const featureState = await State.findOne();
    if (!featureState) {
      return res.status(404).json({ error: "Feature not found" });
    }
    featureState.enabled = !featureState.enabled;
    await featureState.save();
    res.json({ enabled: featureState.enabled });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
