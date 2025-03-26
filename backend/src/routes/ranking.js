import express from "express";
import { sequelize } from "../config/database.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const ranking = await sequelize.query(`
    SELECT "Users".name, SUM("Catches".points) AS totalPoints
    FROM "Catches"
    JOIN "Users" ON "Users".id = "Catches".userId
    GROUP BY "Users".name
    ORDER BY totalPoints DESC
  `);

  res.json(ranking[0]);
});

export default router;
