import express from "express";
import { createMandal, getMandals } from "../controllers/mandalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect("admin"), createMandal);
router.get("/", protect("admin"), getMandals);

export default router;
