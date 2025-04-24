import express from "express";
import { Op } from "sequelize";
import User from "../models/User.js";   // Your User model (make sure it has first_name, last_name, phone_number)
import Catch from "../models/Catch.js"; // Your Catch model with association to User

const router = express.Router();

// 1. Search Users (by first_name, last_name, and/or phone_number)
router.get("/search", async (req, res) => {
  const { first_name, last_name, phone, toise_id } = req.query;
  const whereClause = {};
  console.log("searshing by", req.query );
  if (first_name) {
    whereClause.first_name = { [Op.iLike]: `%${first_name}%` };                       // case-insensitive LIKE :contentReference[oaicite:0]{index=0}
  }
  if (last_name) {
    whereClause.last_name  = { [Op.iLike]: `%${last_name}%` };                         // case-insensitive LIKE :contentReference[oaicite:1]{index=1}
  }
  if (phone) {
    whereClause.phone_number = { [Op.iLike]: `%${phone}%` };                           // case-insensitive LIKE :contentReference[oaicite:2]{index=2}
  }
  if (toise_id) {
    whereClause.toise_id = { [Op.eq]: toise_id };                                      // exact match on foreign key :contentReference[oaicite:3]{index=3}
  }

  try {
    const users = await User.findAll({ where: whereClause });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get user details along with catches
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      include: [{ model: Catch }] ,
      order: [[Catch, 'created_at', 'DESC']]
    });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Update User Information
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone_number, toise_id } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // 2.a Check if toise_id is taken by another user
    if (toise_id != null) {
      const existing = await User.findOne({
        where: { toise_id }                                                            // find a user with this toise_id :contentReference[oaicite:5]{index=5}
      });
      if (existing && existing.id !== user.id) {
        return res.status(400).json({ success: false, UpdateError: "Toise already assigned" });
      }
    }

    // 2.b Perform update (first_name, last_name, phone_number, toise_id)
    await user.update({ first_name, last_name, phone_number, toise_id });               // instance.update() persists all changes :contentReference[oaicite:6]{index=6}

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, UpdateError: error.message });
  }
});




export default router;
