import express from "express";

const router = express.Router();
let catchesEnabled = true;

router.get("/status", (req, res) => {
  res.json({ enabled: catchesEnabled });
});

router.post("/toggle", (req, res) => {
  catchesEnabled = req.body.enabled;
  res.json({ enabled: catchesEnabled });
});

export default router;
