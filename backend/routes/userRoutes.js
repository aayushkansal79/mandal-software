import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllMembers, getLoggedInUser, getMemberStats, getMemberWithReceipts, loginUser, registerUser } from "../controllers/userController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", upload.single("profilePic"), protect("admin"), registerUser);
router.get("/profile", protect(), getLoggedInUser);
// router.get("/members", protect(), getAllMembers);
router.get("/members", protect(), getMemberStats);
router.get("/:id/receipts", protect(), getMemberWithReceipts);

export default router;