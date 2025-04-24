import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// ✅ Create Sequelize instance
export const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  logging: false, // Disable logging (set to `console.log` to see queries)
});

// ✅ Function to check DB connection
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error; // Rethrow the error to prevent server startup
  }
};
