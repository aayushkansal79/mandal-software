import express from "express";
import { addReceipt, getReceiptsByMandal, getReceiptsByMember } from "../controllers/receiptController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect(), addReceipt);
router.get("/", protect(), getReceiptsByMandal);
router.get("/member", protect(), getReceiptsByMember);

export default router;