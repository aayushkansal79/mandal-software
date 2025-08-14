import Receipt from "../models/Receipt.js";
import ReceiptBook from "../models/ReceiptBook.js";
import User from "../models/User.js";

export const assignPads = async (req, res) => {
  try {
    const { memberId, padNumbers } = req.body;

    if (!memberId || !Array.isArray(padNumbers) || padNumbers.length === 0) {
      return res.status(400).json({ message: "Member and pad numbers are required" });
    }

    const loggedInUser = await User.findById(req.user.id);
    if (!loggedInUser) {
      return res.status(404).json({ message: "Logged-in user not found" });
    }

    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const existingPads = await ReceiptBook.find({ padNumber: { $in: padNumbers } });
    if (existingPads.length > 0) {
      const takenPads = existingPads.map(p => p.padNumber);
      return res.status(400).json({ message: `Pad numbers already assigned: ${takenPads.join(", ")}` });
    }

    const year = new Date().getFullYear();

    const padDocs = padNumbers.map(num => ({
      mandal: loggedInUser.mandal,
      mandalName: loggedInUser.mandalName,
      member: member._id,
      memberName: member.memberName,
      padNumber: num,
      year,
    }));

    await ReceiptBook.insertMany(padDocs);

    res.status(201).json({ message: "Pads assigned successfully", pads: padDocs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMembersWithPads = async (req, res) => {
  try {
    const loggedInMandal = req.user.mandal;

    const { year } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    if (!loggedInMandal) {
      return res.status(400).json({ message: "User has no mandal assigned" });
    }

    const result = await ReceiptBook.aggregate([
      { $match: { mandal: loggedInMandal, year: selectedYear } },

      {
        $group: {
          _id: "$member",
          memberName: { $first: "$memberName" },
          pads: { $push: "$padNumber" }
        }
      }
    ]);

    res.json(result);
  } catch (err) {
    console.error("Error fetching members with pads:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getPadsWithTotalAmount = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    const mandalId = req.user.mandal;

    const pads = await ReceiptBook.find({ mandal: mandalId, year: selectedYear })
      .populate("member", "name")
      .sort({ padNumber: 1 });

    const result = [];

    for (const pad of pads) {
      const startReceiptNum = (pad.padNumber - 1) * 25 + 1;
      const endReceiptNum = pad.padNumber * 25;

      const receipts = await Receipt.find({
        mandal: mandalId,
        year: selectedYear,
        receiptNumber: {
          $gte: startReceiptNum,
          $lte: endReceiptNum
        }
      });

      const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);

      result.push({
        padNumber: pad.padNumber,
        memberName: pad.member?.name || pad.memberName,
        totalAmount,
      });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching pads with total amount:", err);
    res.status(500).json({ message: "Server error" });
  }
};