import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Mandal from "../models/Mandal.js";
import Receipt from "../models/Receipt.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Register User
export const registerUser = async (req, res) => {
  try {
    const { username, password, memberName, mobile, address, mandal, type } = req.body;

    if (!username || !password || !memberName || !mobile || !mandal || !type) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const mandalDoc = await Mandal.findById(mandal);
    if (!mandalDoc) {
      return res.status(400).json({ message: "Invalid mandal ID" });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username: normalizedUsername,
      password: hashedPassword,
      memberName,
      mobile,
      address,
      mandal,
      mandalName: mandalDoc.name,
      type,
      profilePic: req.file ? `/uploads/profile_pics/${req.file.filename}` : ""
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        memberName: user.memberName,
        type: user.type,
        mandalName: user.mandalName,
        profilePic: user.profilePic
      }
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Server error while registering user" });
  }
};


// Login User
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const normalizedUsername = username.trim().toLowerCase();

    const user = await User.findOne({ username: normalizedUsername });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

     if (!user.status) {
        return res.status(403).send({ message: "Your account is disabled. Please contact admin." });
    }

    const token = jwt.sign(
      { id: user._id, type: user.type, mandal: user.mandal },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        memberName: user.memberName,
        type: user.type,
        mandal: user.mandal,
        mandalName: user.mandalName,
        profilePic: user.profilePic
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLoggedInUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id; // comes from auth middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both fields are required" });
    }

    // Fetch the logged-in user
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//member details with total count and pad
export const getMemberStats = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const members = await User.aggregate([
      {
        $match: {
          mandal: req.user.mandal,
          type: { $ne: "superadmin" }
        }
      },
      // Lookup pads assigned to member (filter by year)
      {
        $lookup: {
          from: "receiptbooks",
          let: { memberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$member", "$$memberId"] },
                    { $eq: ["$year", selectedYear] }
                  ]
                }
              }
            },
            { $project: { padNumber: 1, _id: 0 } }
          ],
          as: "pads"
        }
      },
      // Lookup receipts added by member (filter by year)
      {
        $lookup: {
          from: "receipts",
          let: { memberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$member", "$$memberId"] },
                    { $eq: ["$year", selectedYear] }
                  ]
                }
              }
            },
            { $project: { amount: 1, _id: 0 } }
          ],
          as: "receipts"
        }
      },
      // Add receipt count & total amount
      {
        $addFields: {
          receiptCount: { $size: "$receipts" },
          totalAmount: { $sum: "$receipts.amount" },
          padsAssigned: "$pads.padNumber"
        }
      },
      // Hide receipts array from final response
      {
        $project: {
          receipts: 0,
          pads: 0
        }
      }
    ]);

    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//same as above but for logges in user
export const getMyMemberStats = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const userId = req.user._id; // Logged in user ID

    const memberStats = await User.aggregate([
      {
        $match: {
          _id: userId, // Only the logged in user
          mandal: req.user.mandal,
          type: { $ne: "superadmin" }
        }
      },
      // Lookup pads assigned to the user (filter by year)
      {
        $lookup: {
          from: "receiptbooks",
          let: { memberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$member", "$$memberId"] },
                    { $eq: ["$year", selectedYear] }
                  ]
                }
              }
            },
            { $project: { padNumber: 1, _id: 0 } }
          ],
          as: "pads"
        }
      },
      // Lookup receipts added by the user (filter by year)
      {
        $lookup: {
          from: "receipts",
          let: { memberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$member", "$$memberId"] },
                    { $eq: ["$year", selectedYear] }
                  ]
                }
              }
            },
            { $project: { amount: 1, _id: 0 } }
          ],
          as: "receipts"
        }
      },
      // Add receipt count & total amount
      {
        $addFields: {
          receiptCount: { $size: "$receipts" },
          totalAmount: { $sum: "$receipts.amount" },
          padsAssigned: "$pads.padNumber"
        }
      },
      // Hide receipts array from final response
      {
        $project: {
          receipts: 0,
          pads: 0
        }
      }
    ]);

    if (!memberStats.length) {
      return res.status(404).json({ message: "No data found for this user" });
    }

    res.status(200).json(memberStats[0]); // Return single object instead of array
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Get all users with type not 'superadmin'
export const getAllMembers = async (req, res) => {
  try {
    const members = await User.find({ mandal: req.user.mandal, type: { $ne: "superadmin" } })
      .select("-password");

    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMemberWithReceipts = async (req, res) => {
  try {
    const { id, year } = req.params;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const member = await User.findById(id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const receipts = await Receipt.find({
      member: id,
      year: selectedYear
    })
      .sort({ receiptNumber: 1 });

    res.json({
      member,
      receipts
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
