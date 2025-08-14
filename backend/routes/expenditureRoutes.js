import express from "express";
import { addExpenses, getAllExpenses } from "../controllers/expenditureController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect(), addExpenses);
router.get("/", protect(), getAllExpenses);

export default router;