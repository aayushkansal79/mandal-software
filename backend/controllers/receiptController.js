import Receipt from "../models/Receipt.js";
import ReceiptBook from "../models/ReceiptBook.js";
import User from "../models/User.js";

export const addReceipt = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("mandal", "name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { receiptNumber, name, amount, mobile, address } = req.body;

    const assignedPads = await ReceiptBook.find({ member: user._id }).select("padNumber");

    if (!assignedPads.length) {
      return res.status(400).json({ message: "No pads assigned to you" });
    }

    const isValid = assignedPads.some(pad => {
      const min = (pad.padNumber - 1) * 25 + 1;
      const max = pad.padNumber * 25;
      return receiptNumber >= min && receiptNumber <= max;
    });

    if (!isValid) {
      return res.status(400).json({
        message: `Receipt number ${receiptNumber} not assigned to you`
      });
    }

    const existingReceipt = await Receipt.findOne({ receiptNumber });
    if (existingReceipt) {
      return res.status(400).json({ message: "Receipt number already exists" });
    }

    const newReceipt = new Receipt({
      receiptNumber,
      name,
      amount,
      mobile,
      address,
      mandal: user.mandal._id,
      mandalName: user.mandal.name,
      member: user._id,
      memberName: user.memberName,
    });

    const saved = await newReceipt.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReceiptsByMandal = async (req, res) => {
  try {

    const receipts = await Receipt.find({ mandal: req.user.mandal })
      .sort({ receiptNumber: 1 });

    res.status(200).json(receipts);
  } catch (err) {
    console.error("Error fetching receipts by mandal:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReceiptsByMember = async (req, res) => {
  try {

    const receipts = await Receipt.find({ mandal: req.user.mandal, member: req.user.id })
      .sort({ receiptNumber: 1 });

    res.status(200).json(receipts);
  } catch (err) {
    console.error("Error fetching receipts by mandal:", err);
    res.status(500).json({ message: "Server error" });
  }
};