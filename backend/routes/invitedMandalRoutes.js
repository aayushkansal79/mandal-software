import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { getInvitedMandals } from "../controllers/invitedMandalController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// router.post("/bulk-upload", upload.single("file"), bulkUploadInvitedMandals);
router.get("/", protect(), getInvitedMandals)

export default router;