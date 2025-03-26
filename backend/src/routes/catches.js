import express from "express";
import Catch from "../models/Catch.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { length, userId } = req.body;
  if (length < 30) return res.status(400).json({ error: "Longueur minimale 30 cm" });

  const points = Math.floor(length * 10);
  await Catch.create({ length, points, userId });

  res.json({ success: true });
});

export default router;
