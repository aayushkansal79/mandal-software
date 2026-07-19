import express from "express";
import { createMember, getMembers, uploadMembersExcel, updateAvailability } from "../controllers/dutyMemberController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/", protect(["admin", "duty"]), createMember);
router.get("/", protect(["admin", "duty"]), getMembers);
router.post("/upload", upload.single("file"), uploadMembersExcel);
router.patch("/toggle-status/:id", protect(["admin", "duty"]), updateAvailability);

export default router;
