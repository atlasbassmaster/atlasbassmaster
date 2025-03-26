import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { name, phone, toise } = req.body;
  let user = await User.findOne({ where: { phone } });

  if (!user) {
    user = await User.create({ name, phone, toise });
  }

  res.json({ success: true, user });
});

export default router;
