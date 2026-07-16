import express from "express";
import { createSession, getLiveSession, getSessions, endSession } from "../controllers/dutySessionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect("admin"), createSession);
router.get("/live", protect("admin"), getLiveSession);
router.get("/", protect("admin"), getSessions);
router.put("/end", protect("admin"), endSession);

export default router;
