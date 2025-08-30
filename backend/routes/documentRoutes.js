import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getDocuments, downloadDocument, deleteDocument, uploadDocuments, } from "../controllers/documentController.js";
import { uploadDocument } from "../middleware/uploadDocuments.js";

const router = express.Router();

router.post("/", protect(), uploadDocument.single("file"), uploadDocuments);
router.get("/", protect(), getDocuments);
router.get("/download/:id", protect(), downloadDocument);
router.delete("/:id", protect(), deleteDocument);

export default router;
