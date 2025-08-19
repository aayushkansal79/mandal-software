import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    payAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'], required: true },
}, { timestamps: true });

const ExpenditureSchema = new mongoose.Schema({
    mandal: { type: mongoose.Schema.Types.ObjectId, ref: "Mandal", required: true },
    mandalName: { type: String, required: true },
    field: { type: String, required: true },
    amount: { type: Number, required: true },
    year: { type: Number, required: true },
    status: { type: Boolean, default: true },
    payments: [PaymentSchema],
}, { timestamps: true });

export default mongoose.model("Expenditure", ExpenditureSchema);