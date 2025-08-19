import express from "express";
import { addExpenses, addPayment, getAllExpenses, updateExpenditure } from "../controllers/expenditureController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect(), addExpenses);
router.patch("/:id", protect(), updateExpenditure);
router.get("/", protect(), getAllExpenses);
router.patch("/payment/:id", protect(), addPayment);

export default router;