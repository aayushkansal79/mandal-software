import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  toggleBreak,
  getLiveBreaks,
  getBreakHistory,
  getMemberBreakHistory,
  closeAllBreaks,
  deleteBreak,
  getBreakReports,
  getBreakReport,
} from "../controllers/dutyBreakController.js";

const router = express.Router();

router.post("/", protect(["admin", "duty"]), toggleBreak);
router.get("/live", protect(["admin", "duty"]), getLiveBreaks);
router.get("/history", protect(["admin", "duty"]), getBreakHistory);
router.get("/member/:memberId", protect(["admin", "duty"]), getMemberBreakHistory);
router.put("/closeall", protect(["admin", "duty"]), closeAllBreaks);
router.delete("/:breakId", protect(["admin", "duty"]), deleteBreak);
router.get("/reports", protect(["admin", "duty"]), getBreakReports);
router.get("/report", protect(["admin", "duty"]), getBreakReport);

export default router;
