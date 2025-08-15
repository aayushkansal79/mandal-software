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
    const selectedYear = new Date().getFullYear();

    // Get all assigned pads for this member for the current year
    const assignedPads = await ReceiptBook.find({ mandal: user.mandal._id, member: user._id, year: selectedYear }).select("padNumber");

    if (!assignedPads.length) {
      return res.status(400).json({ message: "No pads assigned to you" });
    }

    // Validate receipt number belongs to the member
    let matchedPad = null;
    const isValid = assignedPads.some(pad => {
      const min = (pad.padNumber - 1) * 25 + 1;
      const max = pad.padNumber * 25;
      if (receiptNumber >= min && receiptNumber <= max) {
        matchedPad = pad.padNumber;
        return true;
      }
      return false;
    });

    if (!isValid) {
      return res.status(400).json({
        message: `Receipt number ${receiptNumber} not assigned to you`
      });
    }

    // Check for duplicate receipt number (within year)
    const existingReceipt = await Receipt.findOne({ mandal: user.mandal._id, receiptNumber, year: selectedYear });
    if (existingReceipt) {
      return res.status(400).json({ message: "Receipt number already exists" });
    }

    const year = selectedYear;

    // Save new receipt
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
      year,
    });

    const saved = await newReceipt.save();

    // Update totalAmount in the matched ReceiptBook
    await ReceiptBook.findOneAndUpdate(
      { padNumber: matchedPad, mandal: user.mandal._id, member: user._id, year },
      { $inc: { totalAmount: amount } },
      { new: true }
    );

    res.status(201).json(saved);

  } catch (err) {
    console.error("Error adding receipt:", err);
    res.status(500).json({ message: err.message });
  }
};


export const getReceiptsByMandal = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const query = { mandal: req.user.mandal };
    if (selectedYear) query.year = selectedYear;

    const receipts = await Receipt.find(query)
      .sort({ receiptNumber: 1 });

    res.status(200).json(receipts);
  } catch (err) {
    console.error("Error fetching receipts by mandal:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReceiptsByMember = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const query = { mandal: req.user.mandal, member: req.user.id };
    if (selectedYear) query.year = selectedYear;

    const receipts = await Receipt.find(query)
      .sort({ receiptNumber: 1 });

    res.status(200).json(receipts);
  } catch (err) {
    console.error("Error fetching receipts by member:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// export const backfillReceiptBookTotals = async (req, res) => {
//   try {
//     const receiptBooks = await ReceiptBook.find();

//     for (const book of receiptBooks) {
//       const minReceiptNumber = (book.padNumber - 1) * 25 + 1;
//       const maxReceiptNumber = book.padNumber * 25;

//       const totalAmount = await Receipt.aggregate([
//         {
//           $match: {
//             mandal: book.mandal,
//             member: book.member,
//             year: book.year,
//             receiptNumber: { $gte: minReceiptNumber, $lte: maxReceiptNumber }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: "$amount" }
//           }
//         }
//       ]);

//       const amountSum = totalAmount.length > 0 ? totalAmount[0].total : 0;

//       await ReceiptBook.updateOne(
//         { _id: book._id },
//         { $set: { totalAmount: amountSum } }
//       );
//     }

//     res.status(200).json({ message: "Backfill completed successfully" });
//   } catch (err) {
//     console.error("Backfill error:", err);
//     res.status(500).json({ message: "Error during backfill", error: err.message });
//   }
// };