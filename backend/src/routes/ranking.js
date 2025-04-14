import express from "express";
import { sequelize } from "../config/database.js";
import Catch from "../models/Catch.js";
import getUserRankings from "../models/getUserRankings.js";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    // Query to calculate user ranking based on sum of top 5 catches * 10
    const rankingQuery = `
      SELECT
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.phone_number,
        ranking.points
      FROM (
        SELECT
          user_id,
          SUM(length) * 10 AS points
        FROM (
          SELECT
            user_id,
            length,
            ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY length DESC) AS rn
          FROM catch
        ) AS c
        WHERE rn <= 5
        GROUP BY user_id
      ) AS ranking
      JOIN "users" u ON u.id = ranking.user_id
      ORDER BY ranking.points DESC;
    `;

    const [rankingResults] = await sequelize.query(rankingQuery);

    // Query to get the user with the biggest catch (using history for point calculation)
    const biggestCatchQuery = `
      SELECT
        c.*,
        u.first_name,
        u.last_name,
        u.phone_number
      FROM catch c
      JOIN "users" u ON u.id = c.user_id
      ORDER BY c.length DESC
      LIMIT 1;
    `;

    const [biggestCatchResults] = await sequelize.query(biggestCatchQuery);

    res.json({
      success: true,
      rankings: rankingResults,
      topUser: biggestCatchResults.length > 0 ? biggestCatchResults[0] : null
    });
  } catch (error) {
    console.error("Error retrieving rankings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
