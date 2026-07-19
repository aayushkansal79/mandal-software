import express from "express";
import { markAttendance, getAttendanceBySession } from "../controllers/dutyAttendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect(["admin", "duty"]), markAttendance);
router.get("/:sessionId", protect(["admin", "duty"]), getAttendanceBySession);

export default router;
