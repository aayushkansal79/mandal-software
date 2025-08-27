import express from "express";
import { addExpenses, addPayment, deleteExpense, getAllExpenses, updateExpenditure } from "../controllers/expenditureController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect(), addExpenses);
router.patch("/:id", protect(), updateExpenditure);
router.get("/", protect(), getAllExpenses);
router.patch("/payment/:id", protect(), addPayment);
router.delete("/:id", protect(), deleteExpense);

export default router;