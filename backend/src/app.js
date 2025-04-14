import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import { connectDB, sequelize } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import signinRoutes from "./routes/signin.js";
import catchesRoutes from "./routes/catches.js";
import rankingRoutes from "./routes/ranking.js";
import adminRoutes from "./routes/admin.js";
import usersRouter from "./routes/users.js";
const app = express();

app.use(cors({
  origin: "http://localhost:3000", // Change to your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
  credentials: true, // ✅ This is required for cookies and auth headers
}));

// ✅ Manually handle preflight requests
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // Must match `origin`
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});
// ✅ Explicitly handle OPTIONS requests
app.options("*", (req, res) => {
  res.sendStatus(200);
});


app.use(express.json());

app.use("/auth", authRoutes);
app.use("/signin", signinRoutes);
app.use("/catches", catchesRoutes);
app.use("/rankings", rankingRoutes);
app.use("/admin", adminRoutes);
app.use("/users", usersRouter);

const startServer = async () => {
  try {
    await connectDB(); // ✅ Wait for DB connection
    await sequelize.sync({ alter: false }); // ✅ Sync database models

    app.listen(3001, () => {
      console.log(`🚀 Server running on port 3001`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1); // Exit if DB connection fails
  }
};

startServer(); // Start the application
