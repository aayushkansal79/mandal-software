import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Mandal from "../models/Mandal.js";
import Receipt from "../models/Receipt.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Register User
export const registerUser = async (req, res) => {
  try {
    const { username, password, memberName, mobile, address, mandal, role, type } = req.body;

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
      role,
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
        mobile: user.mobile,
        address: user.address,
        role: user.role,
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
        mobile: user.mobile,
        address: user.address,
        role: user.role,
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

// export const setAllRolesToMember = async (req, res) => {
//   try {
//     const result = await User.updateMany(
//       {}, // no filter → all users
//       { $set: { role: "Member" } }
//     );

//     res.status(200).json({
//       message: "All user roles updated to 'Member' successfully",
//       matched: result.matchedCount,
//       modified: result.modifiedCount
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Toggle user status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle the status
    user.status = !user.status;
    await user.save();

    res.json({
      message: `${user.memberName || "User"} Status - ${user.status ? "Active" : "Inactive"}`,
      status: user.status
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLoggedInUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { memberName, mobile, address } = req.body;

    if (mobile && mobile.length < 10) {
      return res.status(400).json({ message: "Mobile number must be at least 10 digits long" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { memberName, mobile, address },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id; // comes from auth middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
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

export const adminChangePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: `Password for ${user.name || "the user"} changed successfully` });
  } catch (err) {
    console.error("Error changing user password by admin:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//member details with total count and pad
export const getMemberStats = async (req, res) => {
  try {
    const { year, memberName, mobile } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    // Base match
    const matchConditions = {
      mandal: req.user.mandal,
    };

    // Apply filters individually
    if (memberName && memberName.trim() !== "") {
      matchConditions.memberName = new RegExp(memberName.trim(), "i");
    }

    if (mobile && mobile.trim() !== "") {
      matchConditions.mobile = new RegExp(mobile.trim(), "i");
    }

    const members = await User.aggregate([
      { $match: matchConditions },

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
            { $sort: { padNumber: 1 } },
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

      // Custom sort priority
      {
        $addFields: {
          sortOrder: {
            $cond: [
              { $eq: ["$type", "admin"] },
              0,
              {
                $switch: {
                  branches: [
                    { case: { $eq: ["$role", "Founder"] }, then: 1 },
                    { case: { $eq: ["$role", "President"] }, then: 2 },
                    { case: { $eq: ["$role", "Vice President"] }, then: 3 },
                    { case: { $eq: ["$role", "Secretary"] }, then: 4 },
                    { case: { $eq: ["$role", "Treasurer"] }, then: 5 },
                    { case: { $eq: ["$role", "Vice Treasurer"] }, then: 6 },
                    { case: { $eq: ["$role", "Trustee"] }, then: 7 },
                    { case: { $eq: ["$role", "Member"] }, then: 8 },
                    { case: { $eq: ["$role", "Office"] }, then: 9 },
                  ],
                  default: 10
                }
              }
            ]
          }
        }
      },

      // Sort by priority
      { $sort: { sortOrder: 1, memberName: 1 } },

      // Hide receipts & pads array
      {
        $project: {
          receipts: 0,
          pads: 0,
          sortOrder: 0
        }
      }
    ]);

    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//same as above but for logged in user
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
            { $sort: { padNumber: 1 } },
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
    const { id } = req.params;
    const { 
      year, 
      page = 1, 
      limit = 50, 
      receiptNumber, 
      amount, 
      memberName, 
      name, 
      mobile 
    } = req.query;

    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const member = await User.findById(id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const query = { member: id };
    if (selectedYear) query.year = selectedYear;

    if (receiptNumber) query.receiptNumber = parseInt(receiptNumber);
    if (amount) query.amount = { $gte: parseFloat(amount) };
    if (memberName) query.memberName = { $regex: memberName, $options: "i" };
    if (name) query.name = { $regex: name, $options: "i" };
    if (mobile) query.mobile = { $regex: mobile, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [receipts, total] = await Promise.all([
      Receipt.find(query)
        .sort({ receiptNumber: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Receipt.countDocuments(query),
    ]);

    res.status(200).json({
      member,
      receipts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });

  } catch (err) {
    console.error("Error fetching member with receipts:", err);
    res.status(500).json({ message: "Server error" });
  }
};

