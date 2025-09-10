import express from "express";
import { sendTestInvite } from "../controllers/whatsappController.js";

const router = express.Router();

router.post("/send-test-invite", sendTestInvite);

export default router;
