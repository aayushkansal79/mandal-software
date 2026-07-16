import express from "express";
import { markAttendance, getAttendanceBySession } from "../controllers/dutyAttendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect("admin"), markAttendance);
router.get("/:sessionId", protect("admin"), getAttendanceBySession);

export default router;
