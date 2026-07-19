import express from "express";
import { createSession, getLiveSession, getSessions, endSession } from "../controllers/dutySessionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect(["admin", "duty"]), createSession);
router.get("/live", protect(["admin", "duty"]), getLiveSession);
router.get("/", protect(["admin", "duty"]), getSessions);
router.put("/end", protect(["admin", "duty"]), endSession);

export default router;
