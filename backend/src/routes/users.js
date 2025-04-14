import express from "express";
import { Op } from "sequelize";
import User from "../models/User.js";   // Your User model (make sure it has first_name, last_name, phone_number)
import Catch from "../models/Catch.js"; // Your Catch model with association to User

const router = express.Router();

// 1. Search Users (by first_name, last_name, and/or phone_number)
router.get("/search", async (req, res) => {
  const { first_name, last_name, phone } = req.query;
  const whereClause = {};

  if (first_name) {
    whereClause.first_name = { [Op.iLike]: `%${first_name}%` };
  }
  if (last_name) {
    whereClause.last_name = { [Op.iLike]: `%${last_name}%` };
  }
  if (phone) {
    whereClause.phone_number = { [Op.iLike]: `%${phone}%` };
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
  const { first_name, last_name, phone_number } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    await user.update({ first_name, last_name, phone_number });
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});



export default router;
