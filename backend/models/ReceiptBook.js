import mongoose from "mongoose";

const ReceiptBookSchema = new mongoose.Schema({
    mandal: { type: mongoose.Schema.Types.ObjectId, ref: "Mandal", required: true },
    mandalName: { type: String, required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    memberName: { type: String, required: true },
    padNumber: { type: Number, required: true, unique: true },
    totalAmount: { type: Number, default: 0 },
    year: { type: Number, required: true },
    status: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("ReceiptBook", ReceiptBookSchema);