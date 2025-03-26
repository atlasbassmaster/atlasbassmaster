import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import catchesRoutes from "./routes/catches.js";
import rankingRoutes from "./routes/ranking.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/catches", catchesRoutes);
app.use("/ranking", rankingRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("🚀 API en cours d'exécution !");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
