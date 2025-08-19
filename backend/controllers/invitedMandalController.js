import path from "path";
import fs from "fs";
import xlsx from "xlsx";
import { translate } from '@vitalets/google-translate-api';
import InvitedMandal from "../models/InvitedMandal.js";


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
        const mandals = await InvitedMandal.find().sort({ createdAt: 1 });
        res.status(200).json(mandals);
    } catch (error) {
        console.error("Error fetching invited mandals:", error);
        res.status(500).json({ message: "Server error" });
    }
};