import { sequelize } from '../config/database.js';
import { QueryTypes } from 'sequelize';

const getUserRanking = async (user_id) => {
  const query = `
    WITH RankedCatches AS (
      SELECT
        user_id,
        length,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY length DESC) AS rn
      FROM catch
    ),
    UserPoints AS (
      SELECT
        user_id,
        SUM(length) * 10 AS points
      FROM RankedCatches
      WHERE rn <= 5
      GROUP BY user_id
    ),
    UserRanks AS (
      SELECT
        user_id,
        points,
        RANK() OVER (ORDER BY points DESC) AS rank
      FROM UserPoints
    )
    SELECT
      ur.user_id,
      ur.points,
      ur.rank,
      (SELECT COUNT(*) FROM UserPoints) AS total_users
    FROM UserRanks ur
    WHERE ur.user_id = :user_id;
  `;

  try {
    const [result] = await sequelize.query(query, {
      replacements: { user_id },
      type: QueryTypes.SELECT,
    });

    return result;
  } catch (error) {
    console.error('Error fetching user ranking:', error);
    throw error;
  }
};

export default getUserRanking;
