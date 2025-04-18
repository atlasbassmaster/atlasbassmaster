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
import stateRoutes from "./routes/state.js";

const app = express();

// Allow any origin with credentials using a dynamic callback:
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Needed for cookies and auth headers
}));

// Handle preflight requests by delegating to cors middleware
app.options("*", cors());

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/signin", signinRoutes);
app.use("/catches", catchesRoutes);
app.use("/rankings", rankingRoutes);
app.use("/admin", adminRoutes);
app.use("/users", usersRouter);
app.use("/api/state", stateRoutes);

const startServer = async () => {
  try {
    await connectDB(); // Wait for DB connection
    await sequelize.sync({ alter: false }); // Sync database models

    app.listen(3001, () => {
      console.log(`🚀 Server running on port 3001`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1); // Exit if DB connection fails104385
  }
};

startServer(); // Start the application
