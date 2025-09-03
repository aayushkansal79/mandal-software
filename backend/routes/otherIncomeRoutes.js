import express from "express";
import { addOtherIncome, getOtherIncomes, updateOtherIncome, deleteOtherIncome, } from "../controllers/otherIncomeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect(), addOtherIncome);
router.get("/", protect(), getOtherIncomes);
router.put("/:id", protect(), updateOtherIncome);
router.delete("/:id", protect(), deleteOtherIncome);

export default router;
