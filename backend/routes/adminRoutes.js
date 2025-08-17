import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getReceiptStatus, updateReceiptStatus } from "../controllers/adminController.js";

const router = express.Router();

router.get("/receipt-status", protect("admin"), getReceiptStatus);
router.put("/receipt-status", protect("admin"), updateReceiptStatus);

export default router;
