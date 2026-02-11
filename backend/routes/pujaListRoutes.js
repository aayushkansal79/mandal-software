import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addPujaMember, deletePujaMember, getPujaList } from "../controllers/pujaListController.js";

const router = express.Router();

router.post("/", protect(), addPujaMember);
router.get("/", protect(), getPujaList);
router.delete("/:id", protect(), deletePujaMember);

export default router;
