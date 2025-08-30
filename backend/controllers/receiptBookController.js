import Receipt from "../models/Receipt.js";
import ReceiptBook from "../models/ReceiptBook.js";
import User from "../models/User.js";
import ExcelJS from "exceljs";

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

      { $sort: { createdAt: 1 } },

      {
        $group: {
          _id: "$member",
          memberName: { $first: "$memberName" },
          pads: { $push: "$padNumber" },
          latestCreatedAt: { $first: "$createdAt" }
        }
      },

      // Final sort by latestCreatedAt if you want sorted members in response
      { $sort: { latestCreatedAt: 1 } }
    ]);

    res.json(result);
  } catch (err) {
    console.error("Error fetching members with pads:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPadsWithTotalAmount = async (req, res) => {
  try {
    const { year, padNumber, memberName, exportExcel } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    const mandalId = req.user.mandal;

    const query = { mandal: mandalId, year: selectedYear };

    if (padNumber) query.padNumber = parseInt(padNumber);
    if (memberName) query.memberName = { $regex: memberName, $options: "i" };

    const pads = await ReceiptBook.find(query)
      .populate("member", "name")
      .sort({ padNumber: 1 });

    if (exportExcel === "true") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Receipt Book");

      worksheet.columns = [
        { header: "S No.", key: "index", width: 5 },
        { header: "Pad Number", key: "padNumber", width: 15 },
        { header: "Member Name", key: "memberName", width: 25 },
        { header: "Total Amount", key: "totalAmount", width: 15 },
      ];

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

      let grandTotal = 0;

      pads.forEach((pad, index) => {
        const totalAmount = pad.totalAmount || 0;
        grandTotal += totalAmount;

        worksheet.addRow({
          index: index + 1,
          padNumber: pad.padNumber,
          memberName: pad.memberName || "N/A",
          totalAmount: totalAmount,
        });
      });

      worksheet.getColumn("totalAmount").numFmt = '₹ ##,##,##0.00';
      worksheet.getColumn("totalAmount").alignment = {
        vertical: "middle",
        horizontal: "right",
      };

      const totalRow = worksheet.addRow({
        index: '',
        padNumber: '',
        memberName: 'Grand Total',
        totalAmount: grandTotal,
      });

      const totalRowIndex = worksheet.lastRow.number;

      totalRow.getCell('D').numFmt = '"₹",##,##,##0.00';
      totalRow.getCell('D').font = { bold: true, size: 11 };
      totalRow.getCell('D').alignment = { horizontal: "right", vertical: "middle" };

      totalRow.getCell('C').font = { bold: true, size: 11 };
      totalRow.getCell('C').alignment = { horizontal: "right", vertical: "middle" };

      ['C', 'D'].forEach((col) => {
        const cell = worksheet.getCell(`${col}${totalRowIndex}`);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE599" },
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      worksheet.columns.forEach((col) => {
        if (col.key !== "totalAmount") {
          col.alignment = { vertical: "middle", horizontal: "center" };
        }
      });

      worksheet.getRow(1).height = 28;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Pads_${selectedYear}.xlsx`
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    res.status(200).json(pads);
  } catch (err) {
    console.error("Error fetching pads with total amount:", err);
    res.status(500).json({ message: "Server error" });
  }
};




// export const getPadsWithTotalAmount = async (req, res) => {
//   try {
//     const { year } = req.query;
//     const selectedYear = year ? parseInt(year) : new Date().getFullYear();
//     const mandalId = req.user.mandal;

//     const pads = await ReceiptBook.find({ mandal: mandalId, year: selectedYear })
//       .populate("member", "name")
//       .sort({ padNumber: 1 });

//     const result = [];

//     for (const pad of pads) {
//       const startReceiptNum = (pad.padNumber - 1) * 25 + 1;
//       const endReceiptNum = pad.padNumber * 25;

//       const receipts = await Receipt.find({
//         mandal: mandalId,
//         year: selectedYear,
//         receiptNumber: {
//           $gte: startReceiptNum,
//           $lte: endReceiptNum
//         }
//       });

//       const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);

//       result.push({
//         padNumber: pad.padNumber,
//         memberName: pad.member?.name || pad.memberName,
//         totalAmount,
//       });
//     }

//     res.status(200).json(result);
//   } catch (err) {
//     console.error("Error fetching pads with total amount:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };