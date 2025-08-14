import express from "express";
import { createMandal, getMandals } from "../controllers/mandalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect("superadmin"), createMandal);
router.get("/", protect("superadmin"), getMandals);

export default router;
