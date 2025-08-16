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

export const memberUpdateReceipt = async (req, res) => {
  try {
    const { id } = req.params; // receipt id
    const { receiptNumber, name, amount, mobile, address } = req.body;

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    // Load user to check pad assignment
    const user = await User.findById(receipt.member).populate("mandal", "name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const selectedYear = receipt.year;

    // Get all pads assigned to this member for this year
    const assignedPads = await ReceiptBook.find({
      mandal: user.mandal._id,
      member: user._id,
      year: selectedYear,
    }).select("padNumber");

    if (!assignedPads.length) {
      return res.status(400).json({ message: "No pads assigned to you" });
    }

    let matchedPad = null;
    if (receiptNumber !== undefined) {
      // Check if the new receiptNumber belongs to assigned pads
      const isValid = assignedPads.some((pad) => {
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
          message: `Receipt number ${receiptNumber} not assigned to you`,
        });
      }

      // Check for duplicate receiptNumber in this year
      const existingReceipt = await Receipt.findOne({
        mandal: receipt.mandal,
        receiptNumber,
        year: selectedYear,
        _id: { $ne: id }, // exclude current receipt
      });

      if (existingReceipt) {
        return res
          .status(400)
          .json({ message: "Receipt number already exists" });
      }
    }

    // === Update Pad Totals ===
    let oldPad = Math.ceil(receipt.receiptNumber / 25);
    let newPad = matchedPad || Math.ceil((receiptNumber ?? receipt.receiptNumber) / 25);

    // Case 1: Receipt number changed → move full amount from oldPad to newPad
    if (receiptNumber !== undefined && newPad !== oldPad) {
      const oldPadDoc = await ReceiptBook.findOne({
        padNumber: oldPad,
        mandal: receipt.mandal,
        member: receipt.member,
        year: receipt.year,
      });
      if (oldPadDoc) {
        oldPadDoc.totalAmount -= receipt.amount;
        await oldPadDoc.save();
      }

      const newPadDoc = await ReceiptBook.findOne({
        padNumber: newPad,
        mandal: receipt.mandal,
        member: receipt.member,
        year: receipt.year,
      });
      if (newPadDoc) {
        newPadDoc.totalAmount += parseInt(amount) ?? receipt.amount;
        await newPadDoc.save();
      }
    }
    // Case 2: Amount changed but receiptNumber same → update same pad total
    else if (parseInt(amount) !== undefined && parseInt(amount) !== receipt.amount) {
      const padDoc = await ReceiptBook.findOne({
        padNumber: oldPad,
        mandal: receipt.mandal,
        member: receipt.member,
        year: receipt.year,
      });
      if (padDoc) {
        padDoc.totalAmount = padDoc.totalAmount - receipt.amount + parseInt(amount);
        await padDoc.save();
      }
    }

    // Update Receipt fields
    receipt.receiptNumber = receiptNumber ?? receipt.receiptNumber;
    receipt.name = name ?? receipt.name;
    receipt.amount = parseInt(amount) ?? receipt.amount;
    receipt.mobile = mobile ?? receipt.mobile;
    receipt.address = address ?? receipt.address;

    const updated = await receipt.save();

    res.status(200).json({
      message: "Receipt updated successfully",
      receipt: updated,
    });
  } catch (err) {
    console.error("Error updating receipt:", err);
    res.status(500).json({ message: err.message });
  }
};


// Admin-only
export const adminUpdateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { receiptNumber, name, amount, mobile, address } = req.body;

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    const selectedYear = receipt.year;

    if (receiptNumber !== undefined) {
      const existingReceipt = await Receipt.findOne({
        mandal: receipt.mandal,
        receiptNumber,
        year: selectedYear,
        _id: { $ne: id },
      });

      if (existingReceipt) {
        return res
          .status(400)
          .json({ message: "Receipt number already exists" });
      }
    }

    let oldPad = Math.ceil(receipt.receiptNumber / 25);
    let newPad = receiptNumber
      ? Math.ceil(receiptNumber / 25)
      : oldPad;

    if (parseInt(amount) !== undefined && parseInt(amount) !== receipt.amount) {
      const oldPadDoc = await ReceiptBook.findOne({
        padNumber: oldPad,
        mandal: receipt.mandal,
        member: receipt.member,
        year: receipt.year,
      });
      if (oldPadDoc) {
        oldPadDoc.totalAmount -= receipt.amount;
        await oldPadDoc.save();
      }

      // Add to new pad
      const newPadDoc = await ReceiptBook.findOne({
        padNumber: newPad,
        mandal: receipt.mandal,
        member: receipt.member,
        year: receipt.year,
      });
      if (newPadDoc) {
        newPadDoc.totalAmount += parseInt(amount);
        await newPadDoc.save();
      }
    } 
    // If only receiptNumber changed (amount same) -> shift totals
    else if (receiptNumber && newPad !== oldPad) {
      // Move the same amount to new pad
      const oldPadDoc = await ReceiptBook.findOne({
        padNumber: oldPad,
        mandal: receipt.mandal,
        member: receipt.member,
        year: receipt.year,
      });
      if (oldPadDoc) {
        oldPadDoc.totalAmount -= receipt.amount;
        await oldPadDoc.save();
      }

      const newPadDoc = await ReceiptBook.findOne({
        padNumber: newPad,
        mandal: receipt.mandal,
        member: receipt.member,
        year: receipt.year,
      });
      if (newPadDoc) {
        newPadDoc.totalAmount += receipt.amount;
        await newPadDoc.save();
      }
    }

    // === Update receipt fields inplace ===
    receipt.receiptNumber = receiptNumber ?? receipt.receiptNumber;
    receipt.name = name ?? receipt.name;
    receipt.amount = parseInt(amount) ?? receipt.amount;
    receipt.mobile = mobile ?? receipt.mobile;
    receipt.address = address ?? receipt.address;

    const updated = await receipt.save();

    res.status(200).json({
      message: "Receipt updated successfully (Admin)",
      updatedReceipt: updated,
    });
  } catch (err) {
    console.error("Error updating receipt (Admin):", err);
    res.status(500).json({ message: err.message });
  }
};

export const getReceiptsByMandal = async (req, res) => {
  try {
    const { year, receiptNumber, amount, memberName, name, mobile } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const query = { mandal: req.user.mandal };

    if (selectedYear) query.year = selectedYear;
    if (receiptNumber) query.receiptNumber = parseInt(receiptNumber);
    if (amount) query.amount = { $gte: parseFloat(amount) };
    if (memberName) query.memberName = { $regex: memberName, $options: "i" };
    if (name) query.name = { $regex: name, $options: "i" };
    if (mobile) query.mobile = { $regex: mobile, $options: "i" };

    const receipts = await Receipt.find(query)
      .sort({ receiptNumber: 1 });

    res.status(200).json(receipts);
  } catch (err) {
    console.error("Error fetching receipts by mandal:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// export const getReceiptsByMandal = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, receiptNumber, amount, memberName, name, mobile, year } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const query = { mandal: req.user.mandal };

//     if (year) query.year = parseInt(year);

//     if (receiptNumber) query.receiptNumber = parseInt(receiptNumber);

//     if (amount) query.amount = { $gte: parseInt(amount) };

//     if (memberName) query.memberName = new RegExp(memberName, "i");
//     if (name) query.name = new RegExp(name, "i");
//     if (mobile) query.mobile = new RegExp(mobile, "i");

//     const total = await Receipt.countDocuments(query);

//     const receipts = await Receipt.find(query)
//       .sort({ receiptNumber: 1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     res.status(200).json({
//       receipts,
//       total,
//       pages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     console.error("Error fetching receipts by mandal:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


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

export const backfillReceiptBookTotals = async (req, res) => {
  try {
    const receiptBooks = await ReceiptBook.find();

    for (const book of receiptBooks) {
      const minReceiptNumber = (book.padNumber - 1) * 25 + 1;
      const maxReceiptNumber = book.padNumber * 25;

      const totalAmount = await Receipt.aggregate([
        {
          $match: {
            mandal: book.mandal,
            member: book.member,
            year: book.year,
            receiptNumber: { $gte: minReceiptNumber, $lte: maxReceiptNumber }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]);

      const amountSum = totalAmount.length > 0 ? totalAmount[0].total : 0;

      await ReceiptBook.updateOne(
        { _id: book._id },
        { $set: { totalAmount: amountSum } }
      );
    }

    res.status(200).json({ message: "Backfill completed successfully" });
  } catch (err) {
    console.error("Backfill error:", err);
    res.status(500).json({ message: "Error during backfill", error: err.message });
  }
};