import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    memberName: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    mandal: { type: mongoose.Schema.Types.ObjectId, ref: "Mandal" },
    mandalName: { type: String },
    type: { type: String, enum: ["superadmin", "admin", "subadmin", "member"], default: "member" },
    status: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);