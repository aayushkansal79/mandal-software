import XLSX from "xlsx";
import DutyMember from "../models/DutyMember.js";
import Counter from "../models/Counter.js";

export const createMember = async (req, res) => {
    try {
        const { name, mobile, aadhaar } = req.body;

        // Validation
        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required."
            });
        }

        if (!mobile?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is required."
            });
        }

        // Check duplicate mobile
        const existingMember = await DutyMember.findOne({
            mobile: mobile.trim()
        });

        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: "Mobile number already exists."
            });
        }

        // Generate Member Code (Atomic)
        const counter = await Counter.findByIdAndUpdate(
            "dutyMember",
            {
                $inc: { sequence: 1 }
            },
            {
                new: true,
                upsert: true
            }
        );

        const memberCode = `DM${String(counter.sequence).padStart(4, "0")}`;

        // Create Member
        const member = await DutyMember.create({
            name: name.trim(),
            memberCode,
            mobile: mobile.trim(),
            aadhaar: aadhaar?.trim() || ""
        });

        return res.status(201).json({
            success: true,
            message: "Member created successfully.",
            member
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};

export const getMembers = async (req, res) => {
  try {
    const members = await DutyMember.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      members,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};


export const uploadMembersExcel = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required."
      });
    }

    // Read Workbook
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer"
    });

    const sheet =
      workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty."
      });
    }

    // Get Existing Mobiles in ONE Query
    const mobileNumbers = rows
      .map((row) => String(row.Mobile || "").trim())
      .filter(Boolean);

    const existingMembers =
      await DutyMember.find({
        mobile: {
          $in: mobileNumbers
        }
      }).select("mobile");

    const existingMobileSet = new Set(
      existingMembers.map((m) => m.mobile)
    );

    // Generate Codes
    const counter =
      await Counter.findByIdAndUpdate(
        "dutyMember",
        {
          $inc: {
            sequence: rows.length
          }
        },
        {
          new: true,
          upsert: true
        }
      );

    let sequence =
      counter.sequence - rows.length + 1;

    const members = [];

    const skipped = [];

    const uploadedMobiles = new Set();

    for (const row of rows) {

      const name = String(
        row.Name || ""
      ).trim();

      const mobile = String(
        row.Mobile || ""
      ).trim();

      const aadhaar = String(
        row.Aadhaar || ""
      ).trim();

      if (!name || !mobile) {

        skipped.push({
          row,
          reason: "Name or Mobile missing"
        });

        sequence++;

        continue;
      }

      if (
        existingMobileSet.has(mobile) ||
        uploadedMobiles.has(mobile)
      ) {

        skipped.push({
          row,
          reason: "Duplicate Mobile"
        });

        sequence++;

        continue;
      }

      uploadedMobiles.add(mobile);

      members.push({
        name,
        mobile,
        aadhaar,
        memberCode:
          `DM${String(sequence).padStart(4, "0")}`
      });

      sequence++;

    }

    if (members.length > 0) {
      await DutyMember.insertMany(members);
    }

    return res.status(200).json({
      success: true,
      message: "Members uploaded successfully.",
      imported: members.length,
      skipped: skipped.length,
      skippedRows: skipped
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error."
    });

  }
};

export const updateAvailability = async (req, res) => {
  try {

    const { id } = req.params;

    const member = await DutyMember.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found."
      });
    }

    member.availability =
      member.availability === "Available"
        ? "Leave"
        : "Available";

    await member.save();

    return res.status(200).json({
      success: true,
      message: "Availability updated successfully.",
      member
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error."
    });

  }
};