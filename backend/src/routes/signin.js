import express from "express";
import User from "../models/User.js";
import Toise from "../models/Toise.js";

const router = express.Router();

router.post("/", async (req, res) => {

try {

  const { first_name, last_name, phone_number, toise_id, code } = req.body;


  let toise = await Toise.findOne({ where: { id:toise_id } });
   if (!toise) {
    console.log("Toise not found.");
    // If user exists, return an error response
    return res.status(400).json({ success: false, message: "Toise not found." });
   }

  else if (toise.code != code) {
     console.log("Code invalide.");
     return res.status(400).json({ success: false, message: "Code invalide." });
  }

  let user = await User.findOne({ where: {toise_id } });

   if (user) {
       console.log("Toise already taken.");
      // If user exists, return an error response
      return res.status(400).json({ success: false, message: "Toise already taken." });
    }

  user = await User.findOne({ where: { phone_number } });

  if (user) {
    console.log("Phone already exists.");
    // If user exists, return an error response
    return res.status(400).json({ success: false, message: "Phone already exists." });
  }

  if (!user) {
    user = await User.create({first_name, last_name, phone_number, toise_id, code});
  }

  console.log("User created", user);

  res.json({ success: true, user });

    } catch (err) {
      console.error("Error occurred:", err);
    }

});

export default router;
