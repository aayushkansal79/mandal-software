import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from "path";
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Routes
import dashboardRoutes from './routes/dashboardRoutes.js';
import mandalRoutes from './routes/mandalRoutes.js';
import userRoutes from './routes/userRoutes.js';
import receiptBookRoutes from './routes/receiptBookRoutes.js'
import receiptRoutes from './routes/receiptRoutes.js';
import otherIncomeRoutes from './routes/otherIncomeRoutes.js'
import expenditureRoutes from './routes/expenditureRoutes.js';
import invitedMandalRoutes from './routes/invitedMandalRoutes.js';
import documentRoutes from './routes/documentRoutes.js'
import adminRoutes from './routes/adminRoutes.js';

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App config
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve /uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/mandal", mandalRoutes);
app.use("/api/user", userRoutes);
app.use("/api/receiptbook", receiptBookRoutes);
app.use("/api/receipt", receiptRoutes);
app.use("/api/other-income", otherIncomeRoutes);
app.use("/api/expenditure", expenditureRoutes);
app.use("/api/invitedmandal", invitedMandalRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Serve frontend (Vite's dist folder)
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// ✅ Catch-all route for SPA (React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
