import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminChangePassword, changePassword, getAllMembers, getLoggedInUser, getMemberStats, getMemberWithReceipts, getMyMemberStats, loginUser, registerUser, toggleUserStatus, updateProfile } from "../controllers/userController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", upload.single("profilePic"), protect("admin"), registerUser);
router.get("/profile", protect(), getLoggedInUser);
router.put("/change-password", protect(), changePassword);
router.put("/admin-change-password/:userId", protect("admin"), adminChangePassword);
router.patch("/toggle-status/:id", protect("admin"), toggleUserStatus);
router.put("/update-profile", protect(), updateProfile);
// router.get("/members", protect(), getAllMembers);
router.get("/members", protect(), getMemberStats);
router.get("/my-member", protect(), getMyMemberStats);
router.get("/:id/receipts", protect(), getMemberWithReceipts);

export default router;