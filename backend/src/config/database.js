import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(process.env.DB_NAME,
                                         process.env.DB_USER,
                                         process.env.DB_PASSWORD, {
                                             host: process.env.DB_HOST,
                                             port: process.env.DB_PORT,
                                             dialect: "postgres",
                                             logging: false, // Désactive les logs SQL
  
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connecté à PostgreSQL");
  } catch (error) {
    console.error("❌ Erreur de connexion :", error);
  }
};
