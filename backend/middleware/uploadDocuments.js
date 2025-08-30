import multer from "multer";
import path from "path";
import fs from "fs";

const baseDir = "uploads/documents";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const year = req.body.year || new Date().getFullYear();
    const mandal = req.user.mandalName || "unknown";
    const dir = path.join(baseDir, String(mandal), String(year));

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Unsupported file type"), false);
};

export const uploadDocument = multer({ storage, fileFilter });
