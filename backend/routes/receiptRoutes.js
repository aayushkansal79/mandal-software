import express from "express";
import { addReceipt, adminUpdateReceipt, backfillReceiptBookTotals, getReceiptsByMandal, getReceiptsByMember, memberUpdateReceipt } from "../controllers/receiptController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect(), addReceipt);
router.post("/backfill-totals", backfillReceiptBookTotals);
router.patch("/:id", protect(), memberUpdateReceipt);
router.patch("/admin/:id", protect(), adminUpdateReceipt);
router.get("/", protect(), getReceiptsByMandal);
router.get("/member", protect(), getReceiptsByMember);

export default router;