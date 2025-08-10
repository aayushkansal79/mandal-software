import mongoose from "mongoose";

const ReceiptSchema = new mongoose.Schema({
    mandal: { type: mongoose.Schema.Types.ObjectId, ref: "Mandal", required: true },
    mandalName: { type: String, required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    memberName: { type: String, required: true },
    receiptNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    mobile: { type: String},
    address: { type: String},
    status: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Receipt", ReceiptSchema);