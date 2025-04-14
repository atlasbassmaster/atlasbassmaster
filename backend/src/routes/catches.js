import express from "express";
import Catch from "../models/Catch.js";
import getUserRankings from "../models/getUserRankings.js";


const router = express.Router();

router.get("/rankings/:user_id", async (req, res) => {
    const { user_id } = req.params;
  try {
    const rankings = await getUserRankings(user_id);
    console.log("ookook");
    console.log(rankings);
    res.json({ success: true, rankings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching rankings" });
  }
});



// Create a new catch
router.post("/", async (req, res) => {
  try {
    const { length, user_id } = req.body;

    if (length < 30) {
      return res.status(400).json({ error: "Longueur minimale 30 cm" });
    }

    const points = Math.floor(length * 10);
    const newCatch = await Catch.create({ length, user_id });
    const userCatches = await Catch.findAll({ where: { user_id } });
    res.json({ success: true, catches: userCatches});
  } catch (error) {
    console.error("Error creating catch:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.delete("/:id", async (req, res) => {
  const { userId, catchId } = req.body;

  if (!userId || !catchId) {
    return res.status(400).json({ error: "User ID and Catch ID are required." });
  }

  try {
    const result = await Catch.destroy({ where: { id: catchId, user_id:userId } });

    if (result === 0) {
      return res.status(404).json({ error: "Catch not found or unauthorized." });
    }

    res.status(200).json({ status: true, message: "Catch deleted successfully." });
  } catch (error) {
    console.error("Error deleting catch:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Retrieve all catches
/*router.get("/", async (req, res) => {
  try {
    const catches = await Catch.findAll(); // Fetch all catches
    res.json(catches);
  } catch (error) {
    console.error("Error retrieving catches:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});*/

// Retrieve catches for a specific user
router.get("/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const userCatches = await Catch.findAll({ where: { user_id }, order: [['created_at', 'DESC']]  });
    if (!userCatches.length) {
      return res.status(404).json({ error: "No catches found for this user" });
    }

    res.json(userCatches);
  } catch (error) {
    console.error("Error retrieving user catches:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const catchId = req.params.id;
  const { length, toise_id } = req.body;

  // Validate the length value
  if (!length || isNaN(length) || parseFloat(length) < 30) {
    return res.status(400).json({
      message: "Invalid length. The length must be a number greater than or equal to 30."
    });
  }

  try {
    // Find the catch record by its primary key
    const catchRecord = await Catch.findByPk(catchId);

    if (!catchRecord) {
      return res.status(404).json({ message: "Catch not found." });
    }

    // Update the catch record. Adjust the payload if you need to update additional fields like toise_id.
    await catchRecord.update({
      length: parseFloat(length)
      // If you want to update toise_id as well, include it:
      // toise_id: toise_id
    });

    return res.json({
      success: true,
      message: "Catch updated successfully.",
      catch: catchRecord
    });
  } catch (error) {
    console.error("Error updating catch:", error);
    return res.status(500).json({ message: "Error updating catch.", error: error.message });
  }
});

export default router;
