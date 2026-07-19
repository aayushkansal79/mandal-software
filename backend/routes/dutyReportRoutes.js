import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllReports, getDayReport } from "../controllers/dutyReportController.js";

const router = express.Router();

router.get("/", protect(["admin", "duty"]), getAllReports);
router.get("/day", protect(["admin", "duty"]), getDayReport);

export default router;