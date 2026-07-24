import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./configs/db.js";

import authRoutes from "./routes/userAuth.js";
import userRoutes from "./routes/userRoute.js";
import habitRoutes from "./routes/habitRoute.js";
import dailyHabitRoutes from "./routes/dailyHabitsRoute.js";
import routineRoutes from "./routes/routineRoute.js";
import taskRoutes from "./routes/taskRoute.js";

// ======================================================
// Load Environment Variables
// ======================================================
dotenv.config();

// ======================================================
// Initialize Express App
// ======================================================
const app = express();
const PORT = process.env.PORT || 5000;

// ======================================================
// Allowed Frontend Origins
// ======================================================
const allowedOrigins = [
  "http://localhost:5173",
  "https://saiscomeback.vercel.app",
];

// ======================================================
// Connect to MongoDB
// ======================================================
await connectDB();

// ======================================================
// Global Middlewares
// ======================================================
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// ======================================================
// Health Check Route
// ======================================================
app.get("/", (req, res) => {
  res.send("Hello World");
});

// ======================================================
// API Routes
// ======================================================
app.use("/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/daily-habits", dailyHabitRoutes);
app.use("/api/routine", routineRoutes);
app.use("/api/tasks", taskRoutes);

// ======================================================
// Start Server
// ======================================================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
