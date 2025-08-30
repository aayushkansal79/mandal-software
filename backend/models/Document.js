import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    mandal: { type: mongoose.Schema.Types.ObjectId, ref: "Mandal", required: true },
    year: { type: Number, required: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
export default Document;
