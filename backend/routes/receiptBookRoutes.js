import express from "express";
import { assignPads, getMembersWithPads, getPadsWithTotalAmount,  } from "../controllers/receiptBookController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/assign", protect(["superadmin", "admin"]), assignPads);
router.get("/members", protect(), getMembersWithPads);
router.get("/pads", protect(), getPadsWithTotalAmount);

export default router;
