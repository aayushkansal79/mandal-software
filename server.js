import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';


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

// routes
// app.use("/api/dashboard", dashboardRoutes);

// database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("DB Connected"))
    .catch((err) => console.error(err));

// listen
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});