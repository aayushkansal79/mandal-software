import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { changePassword, getAllMembers, getLoggedInUser, getMemberStats, getMemberWithReceipts, getMyMemberStats, loginUser, registerUser } from "../controllers/userController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", upload.single("profilePic"), protect(["superadmin", "admin"]), registerUser);
router.get("/profile", protect(), getLoggedInUser);
router.put("/change-password", protect(), changePassword);
// router.get("/members", protect(), getAllMembers);
router.get("/members", protect(), getMemberStats);
router.get("/my-member", protect(), getMyMemberStats);
router.get("/:id/receipts", protect(), getMemberWithReceipts);

export default router;