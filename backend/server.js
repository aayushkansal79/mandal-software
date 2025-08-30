import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from "path";
import 'dotenv/config';
import dashboardRoutes from './routes/dashboardRoutes.js';
import mandalRoutes from './routes/mandalRoutes.js';
import userRoutes from './routes/userRoutes.js';
import receiptBookRoutes from './routes/receiptBookRoutes.js'
import receiptRoutes from './routes/receiptRoutes.js';
import expenditureRoutes from './routes/expenditureRoutes.js';
import invitedMandalRoutes from './routes/invitedMandalRoutes.js';
import documentRoutes from './routes/documentRoutes.js'
import adminRoutes from './routes/adminRoutes.js';

// app config
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(cors());

// test route
app.get("/", (req, res) => {
    res.send("Shyam Parivar - API Working");
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/mandal", mandalRoutes);
app.use("/api/user", userRoutes);
app.use("/api/receiptbook", receiptBookRoutes);
app.use("/api/receipt", receiptRoutes);
app.use("/api/expenditure", expenditureRoutes);
app.use("/api/invitedmandal", invitedMandalRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/admin", adminRoutes);

// database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("DB Connected"))
    .catch((err) => console.error(err));

// listen
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});