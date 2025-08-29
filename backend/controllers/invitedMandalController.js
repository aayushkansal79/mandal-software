import path from "path";
import fs from "fs";
import xlsx from "xlsx";
import { translate } from '@vitalets/google-translate-api';
import InvitedMandal from "../models/InvitedMandal.js";
import ExcelJS from "exceljs";


// export const bulkUploadInvitedMandals = async (req, res) => {
//   const filePath = path.join("uploads", "mandals.xlsx"); // hardcoded file

//   try {
//     // Read Excel
//     const workbook = xlsx.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     // Detect Hindi chars
//     const needsTranslation = (text) =>
//       typeof text === "string" && /[\u0900-\u097F]/.test(text);

//     const translatedMandals = await Promise.all(
//       sheetData.map(async (row) => {
//         let { mandalName, contactPerson, mobile, address } = row;

//         if (needsTranslation(mandalName)) {
//           const result = await translate(mandalName, { from: "hi", to: "en" });
//           mandalName = result.text;
//         }

//         if (needsTranslation(contactPerson)) {
//           const result = await translate(contactPerson, { from: "hi", to: "en" });
//           contactPerson = result.text;
//         }

//         if (needsTranslation(address)) {
//           const result = await translate(address, { from: "hi", to: "en" });
//           address = result.text;
//         }

//         return { mandalName, contactPerson, mobile, address };
//       })
//     );

//     // Save to DB
//     const savedMandals = await InvitedMandal.insertMany(translatedMandals);

//     res.status(201).json({
//       message: "Invited mandals uploaded successfully",
//       count: savedMandals.length,
//       data: savedMandals,
//     });
//   } catch (error) {
//     console.error("Error uploading invited mandals:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const addInvitedMandal = async (req, res) => {
    try {
        const { mandalName, contactPerson, mobile, address } = req.body;

        if (!mandalName || !contactPerson || !mobile || !address) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newMandal = new InvitedMandal({
            mandalName,
            contactPerson,
            mobile,
            address
        });

        const savedMandal = await newMandal.save();

        res.status(201).json({
            message: "Invited mandal added successfully",
            data: savedMandal
        });
    } catch (error) {
        console.error("Error adding invited mandal:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getInvitedMandals = async (req, res) => {
  try {
    const { 
      mandalName, 
      contactPerson, 
      address, 
      mobile, 
      page = 1, 
      limit = 50,
      exportExcel 
    } = req.query;

    const query = {};

    if (mandalName) query.mandalName = { $regex: mandalName, $options: "i" };
    if (contactPerson) query.contactPerson = { $regex: contactPerson, $options: "i" };
    if (address) query.address = { $regex: address, $options: "i" };
    if (mobile) query.mobile = { $regex: mobile, $options: "i" };

    if (exportExcel === "true") {
      const mandals = await InvitedMandal.find(query).sort({ createdAt: 1 });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Invited Mandals");

      // Add headers
      worksheet.columns = [
        { header: "S No.", key: "index", width: 7 },
        { header: "Mandal Name", key: "mandalName", width: 60 },
        { header: "Contact Person", key: "contactPerson", width: 25 },
        { header: "Mobile", key: "mobile", width: 15 },
        { header: "Address", key: "address", width: 100 },
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

      mandals.forEach((m, i) => {
        worksheet.addRow({
          index: i + 1,
          mandalName: m.mandalName,
          contactPerson: m.contactPerson,
          mobile: m.mobile,
          address: m.address,
        });
      });

      worksheet.columns.forEach((col) => {
        if (col.key !== "address") {
          col.alignment = { vertical: "middle", horizontal: "center" };
        }
      });
      worksheet.getColumn("address").alignment = { vertical: "middle", horizontal: "left" };

      worksheet.getRow(1).height = 28;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=InvitedMandals.xlsx`
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [mandals, total] = await Promise.all([
      InvitedMandal.find(query)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      InvitedMandal.countDocuments(query),
    ]);

    res.status(200).json({
      mandals,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });

  } catch (error) {
    console.error("Error fetching invited mandals:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateInvitedMandal = async (req, res) => {
  try {
    const { id } = req.params;
    const { mandalName, contactPerson, mobile, address } = req.body;

    const mandal = await InvitedMandal.findById(id);
    if (!mandal) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (mandalName) mandal.mandalName = mandalName;
    if (contactPerson) mandal.contactPerson = contactPerson;
    if (mobile) mandal.mobile = mobile;
    if (address) mandal.address = address;

    const updated = await mandal.save();
    res.json({ message: "Mandal updated successfully", updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update mandal" });
  }
};
