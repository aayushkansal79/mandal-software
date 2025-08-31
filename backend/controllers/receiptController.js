import Admin from "../models/Admin.js";
import Receipt from "../models/Receipt.js";
import ReceiptBook from "../models/ReceiptBook.js";
import User from "../models/User.js";
import ExcelJS from "exceljs";

export const addReceipt = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("mandal", "name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let field = "";
    if (user.mandal.name === "Shri Shyam Sewa Sangh Sarojini Nagar") {
      field = "sarojiniReceiptStatus";
    } else if (user.mandal.name === "Shri Shyam Sewak Yuva Mandal Sangam Vihar") {
      field = "sangamReceiptStatus";
    } else {
      return res.status(400).json({ message: "Invalid mandal name" });
    }
  
    const admin = await Admin.findOne().select(field);
    if (!admin) {
      return res.status(404).json({ message: "Admin settings not found" });
    }

    if (!admin[field]) {
      return res.status(403).json({ message: "Receipt creation is disabled for your mandal" });
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

// export const getReceiptsByMandal = async (req, res) => {
//   try {
//     const { year, receiptNumber, amount, memberName, name, mobile } = req.query;
//     const selectedYear = year ? parseInt(year) : new Date().getFullYear();

//     const query = { mandal: req.user.mandal };

//     if (selectedYear) query.year = selectedYear;
//     if (receiptNumber) query.receiptNumber = parseInt(receiptNumber);
//     if (amount) query.amount = { $gte: parseFloat(amount) };
//     if (memberName) query.memberName = { $regex: memberName, $options: "i" };
//     if (name) query.name = { $regex: name, $options: "i" };
//     if (mobile) query.mobile = { $regex: mobile, $options: "i" };

//     const receipts = await Receipt.find(query)
//       .sort({ receiptNumber: 1 });

//     res.status(200).json(receipts);
//   } catch (err) {
//     console.error("Error fetching receipts by mandal:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


export const getReceiptsByMandal = async (req, res) => {
  try {
    const { 
      year, 
      page = 1, 
      limit = 50, 
      receiptNumber, 
      amount, 
      memberName, 
      name, 
      mobile,
      exportExcel,
      extra
    } = req.query;

    const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    const query = { mandal: req.user.mandal };

    if (selectedYear) query.year = selectedYear;
    if (receiptNumber) query.receiptNumber = parseInt(receiptNumber);
    if (amount) query.amount = { $gte: parseFloat(amount) };
    if (memberName) query.memberName = { $regex: memberName, $options: "i" };
    if (name) query.name = { $regex: name, $options: "i" };
    if (mobile) query.mobile = { $regex: mobile, $options: "i" };

    if (exportExcel === "true") {
      const receipts = await Receipt.find(query).sort({ receiptNumber: 1 });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Receipts");

      // === Columns Setup ===
      const columns = [
        { header: "S No.", key: "index", width: 7 },
        { header: "Receipt No", key: "receiptNumber", width: 12 },
        { header: "Member Name", key: "memberName", width: 25 },
        { header: "Name", key: "name", width: 25 },
      ];
      
      if (extra === "true") {
        columns.push(
          { header: "Amount", key: "amount", width: 10 },
          { header: "Mobile", key: "mobile", width: 15 },
          { header: "Address", key: "address", width: 25 }
        );
      }

      worksheet.columns = columns;

      // === Header Row Styling ===
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4F81BD" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // === Data Rows ===
      receipts.forEach((r, i) => {
        const rowData = {
          index: i + 1,
          receiptNumber: r.receiptNumber,
          memberName: r.memberName,
          name: r.name,
        };
        
        if (extra === "true") {
          rowData.amount = r.amount,
          rowData.mobile = r.mobile;
          rowData.address = r.address;
        }

        worksheet.addRow(rowData);
      });

      // === Column Alignment ===
      worksheet.columns.forEach((col) => {
        if (col.key !== "amount") {
          col.alignment = { vertical: "middle", horizontal: "center" };
        }
      });

      // === Amount Column Formatting ===
      if(extra === "true"){
        worksheet.getColumn("amount").numFmt = '₹ #,##,##0';
        worksheet.getColumn("amount").alignment = {
          vertical: "middle",
          horizontal: "right",
        };
      }
        
      worksheet.getRow(1).height = 28;

      // === Response Headers ===
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Receipts_${selectedYear}.xlsx`
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    // === Pagination Logic ===
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [receipts, total] = await Promise.all([
      Receipt.find(query)
        .sort({ receiptNumber: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Receipt.countDocuments(query),
    ]);

    res.status(200).json({
      receipts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });

  } catch (err) {
    console.error("Error fetching receipts by mandal:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// export const getReceiptsByMandal = async (req, res) => {
//   try {
//     const { 
//       year, 
//       page = 1, 
//       limit = 50, 
//       receiptNumber, 
//       amount, 
//       memberName, 
//       name, 
//       mobile 
//     } = req.query;

//     const selectedYear = year ? parseInt(year) : new Date().getFullYear();

//     // Base query
//     const query = { mandal: req.user.mandal };

//     if (selectedYear) query.year = selectedYear;
//     if (receiptNumber) query.receiptNumber = parseInt(receiptNumber);
//     if (amount) query.amount = { $gte: parseFloat(amount) };
//     if (memberName) query.memberName = { $regex: memberName, $options: "i" };
//     if (name) query.name = { $regex: name, $options: "i" };
//     if (mobile) query.mobile = { $regex: mobile, $options: "i" };

//     // Pagination calculation
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const [receipts, total] = await Promise.all([
//       Receipt.find(query)
//         .sort({ receiptNumber: 1 })
//         .skip(skip)
//         .limit(parseInt(limit)),
//       Receipt.countDocuments(query),
//     ]);

//     res.status(200).json({
//       receipts,
//       total,
//       page: parseInt(page),
//       pages: Math.ceil(total / parseInt(limit)),
//     });
//   } catch (err) {
//     console.error("Error fetching receipts by mandal:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };



export const getReceiptsByMember = async (req, res) => {
  try {
    const { 
      year, 
      page = 1, 
      limit = 50, 
      receiptNumber, 
      amount,
      name, 
      mobile 
    } = req.query;

    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const query = { mandal: req.user.mandal, member: req.user.id };
    if (selectedYear) query.year = selectedYear;
    if (receiptNumber) query.receiptNumber = parseInt(receiptNumber);
    if (amount) query.amount = { $gte: parseFloat(amount) };
    if (name) query.name = { $regex: name, $options: "i" };
    if (mobile) query.mobile = { $regex: mobile, $options: "i" };

    // Pagination calculation
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [receipts, total] = await Promise.all([
      Receipt.find(query)
        .sort({ receiptNumber: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Receipt.countDocuments(query),
    ]);

    res.status(200).json({
      receipts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error("Error fetching receipts by member:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const exportReceiptsInGroups = async (req, res) => {
  try {
    const { year, extra } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const receipts = await Receipt.find({
      year: selectedYear,
      mandal: req.user.mandal,
    }).sort({ receiptNumber: 1 });

    if (!receipts.length) {
      return res.status(404).json({ message: "No receipts found" });
    }

    const workbook = new ExcelJS.Workbook();
    const maxReceiptNo = receipts[receipts.length - 1].receiptNumber;
    const totalPages = Math.ceil(maxReceiptNo / 25);

    for (let page = 1; page <= totalPages; page++) {
      const start = (page - 1) * 25 + 1;
      const end = page * 25;
      const group = receipts.filter(
        (r) => r.receiptNumber >= start && r.receiptNumber <= end
      );

      if (group.length === 0) continue;

      const worksheet = workbook.addWorksheet(
        `${page}_${group[0].memberName || "Group"}`
      );

      const mergeEndCol = extra === "true" ? "E" : "C";
      worksheet.mergeCells(`A1:${mergeEndCol}1`);
      const titleCell1 = worksheet.getCell("A1");
      titleCell1.value = `Pad No.: ${page} (${group[0].memberName})`;
      titleCell1.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
      titleCell1.alignment = { vertical: "middle", horizontal: "center" };
      titleCell1.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF8C00" },
      };
      worksheet.getRow(1).height = 30;

      // === Column Headers ===
      const columns = [
        { key: "receiptNumber", width: 12 },
        { key: "name", width: 25 },
        { key: "amount", width: 15 },
      ];

      if (extra === "true") {
        columns.push(
          { key: "mobile", width: 15 },
          { key: "address", width: 30 }
        );
      }

      worksheet.columns = columns;

      const headerRowValues = ["Receipt No", "Name", "Amount"];
      if (extra === "true") headerRowValues.push("Mobile", "Address");

      worksheet.addRow(headerRowValues);

      worksheet.getRow(2).eachCell((cell) => {
        cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4F81BD" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // === Data Rows ===
      group.forEach((r) => {
        const rowData = {
          receiptNumber: r.receiptNumber,
          name: r.name,
          amount: r.amount,
        };

        if (extra === "true") {
          rowData.mobile = r.mobile;
          rowData.address = r.address;
        }

        worksheet.addRow(rowData);
      });

      worksheet.columns.forEach((col) => {
        if (col.key !== "amount") {
          col.alignment = { vertical: "middle", horizontal: "center" };
        }
      });

      worksheet.getColumn("amount").numFmt = '"₹"#,##0.00';
      worksheet.getColumn("amount").alignment = {
        vertical: "middle",
        horizontal: "right",
      };

      // === Grand Total Row ===
      const totalRowIndex = worksheet.lastRow.number + 1;
      const totalAmount = group.reduce((sum, r) => sum + (r.amount || 0), 0);

      const totalRowData = {
        receiptNumber: '',
        name: 'Grand Total',
        amount: totalAmount,
      };

      if (extra === "true") {
        totalRowData.mobile = '';
        totalRowData.address = '';
      }

      const totalRow = worksheet.addRow(totalRowData);

      totalRow.getCell("amount").numFmt = '"₹"##,##,##0.00';
      totalRow.getCell("amount").font = { bold: true };
      totalRow.getCell("amount").alignment = {
        horizontal: "right",
        vertical: "middle",
      };

      totalRow.getCell("name").font = { bold: true };
      totalRow.getCell("name").alignment = {
        horizontal: "right",
        vertical: "middle",
      };

      // Highlight Total Row
      const highlightCols = ["A", "B", "C"];
      if (extra === "true") highlightCols.push("D", "E");

      highlightCols.forEach((col) => {
        const cell = worksheet.getCell(`${col}${totalRowIndex}`);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE599" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Receipts_${selectedYear}_Members.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exporting grouped receipts:", err);
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