import Document from "../models/Document.js";
import fs from "fs";
import path from "path";

const baseDir = "uploads/documents";

export const uploadDocuments = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const mandalId = req.user.mandal;
    const mandalName = req.user.mandalName || "unknown";
    const year = req.body.year || new Date().getFullYear();
    const originalName = req.file.originalname;

    const existingDoc = await Document.findOne({ mandal: mandalId, year, originalName });

    if (existingDoc) {
      return res.status(400).json({ message: "File with the same name already exists" });
    }

    const newDoc = new Document({
      mandal: mandalId,
      year,
      originalName,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
    });

    await newDoc.save();

    res.status(201).json({ message: "Document uploaded", document: newDoc });
  } catch (err) {
    console.error("Upload document error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getDocuments = async (req, res) => {
  try {
    const mandalId = req.user.mandal;

    const docs = await Document.find({ mandal: mandalId })
      .sort({ year: -1, createdAt: -1 })
      .lean();

    const grouped = docs.reduce((acc, doc) => {
      if (!acc[doc.year]) acc[doc.year] = [];
      acc[doc.year].push(doc);
      return acc;
    }, {});

    res.status(200).json(grouped);
  } catch (err) {
    console.error("Get documents error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Document.findById(id);
    if (!doc) {
      console.error("Document not found:", id);
      return res.status(404).json({ message: "Document not found" });
    }

    if (doc.mandal.toString() !== req.user.mandal.toString()) {
      console.error("Unauthorized access attempt by user:", req.user._id);
      return res.status(403).json({ message: "Unauthorized" });
    }

    const mandalName = req.user.mandalName || "unknown";
    const filePath = path.join(baseDir, String(mandalName), String(doc.year), doc.filename);

    if (!fs.existsSync(filePath)) {
      console.error("File missing on server:", filePath);
      return res.status(404).json({ message: "File missing on server" });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}"`);
    res.setHeader('Content-Type', doc.mimetype);

    res.download(filePath, doc.originalName, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        return res.status(500).json({ message: "Error while downloading the file" });
      }
    });

  } catch (err) {
    console.error("Error in downloadDocumentController:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);

    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (doc.mandal.toString() !== req.user.mandal.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const mandalName = req.user.mandalName || "unknown";
    const filePath = path.join(baseDir, String(mandalName), String(doc.year), doc.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Document.deleteOne({ _id: id });

    res.status(200).json({ message: "Document deleted" });
  } catch (err) {
    console.error("Delete document error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
