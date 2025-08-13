import express from "express";
import { assignPads, getMembersWithPads,  } from "../controllers/receiptBookController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/assign", protect(), assignPads);
router.get("/members", protect(), getMembersWithPads);

export default router;
