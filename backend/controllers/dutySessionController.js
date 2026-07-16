import DutyAttendance from "../models/DutyAttendance.js";
import DutyMember from "../models/DutyMember.js";
import DutySession from "../models/DutySession.js";

export const createSession = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Session title is required."
            });
        }

        const activeSession = await DutySession.findOne({
            status: "Active"
        });

        if (activeSession) {
            return res.status(400).json({
                success: false,
                message: "Another session is already active."
            });
        }

        const now = new Date();

        const date = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const existingSession = await DutySession.findOne({
            title: title.trim(),
            date
        });

        if (existingSession) {
            return res.status(400).json({
                success: false,
                message: "A session with this title already exists for today."
            });
        }

        const session = await DutySession.create({
            title: title.trim(),
            date,
            startTime: now,
            status: "Active"
        });

        return res.status(201).json({
            success: true,
            message: "Session started successfully.",
            session
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const endSession = async (req, res) => {
    try {

        // Find Active Session
        const session = await DutySession.findOne({
            status: "Active"
        });

        if (!session) {
            return res.status(400).json({
                success: false,
                message: "No active session found."
            });
        }

        // Get all active members
        const members = await DutyMember.find({
            status: true
        }).select("_id availability");

        // Get members whose attendance is already marked
        const attendance = await DutyAttendance.find({
            session: session._id
        }).select("member");

        const markedMemberIds = new Set(
            attendance.map(item => item.member.toString())
        );

        // Prepare absent records
        const absentMembers = members
            .filter(member => !markedMemberIds.has(member._id.toString()))
            .map(member => ({
                session: session._id,
                member: member._id,
                status:
                    member.availability === "Leave"
                        ? "Leave"
                        : "Absent",
                attendanceTime: null
            }));

        // Insert all absent records at once
        if (absentMembers.length > 0) {
            await DutyAttendance.insertMany(absentMembers);
        }

        const leaveCount = absentMembers.filter(
            member => member.status === "Leave"
        ).length;

        const absentCount = absentMembers.filter(
            member => member.status === "Absent"
        ).length;

        // Complete Session
        session.presentCount = attendance.length;
        session.absentCount = absentCount;
        session.leaveCount = leaveCount;
        session.status = "Completed";
        session.endTime = new Date();

        await session.save();

        return res.status(200).json({
            success: true,
            message: "Session ended successfully.",
            summary: {
                totalMembers: members.length,
                present: attendance.length,
                absent: absentCount,
                leave: leaveCount
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });

    }
};

export const getSessions = async (req, res) => {
  try {
    // Get Active Session
    const activeSession = await DutySession.findOne({
      status: "Active",
    });

    // Get Session History
    const sessions = await DutySession.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      activeSession,
      sessions,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

export const getLiveSession = async (req, res) => {
  try {

    const session = await DutySession.findOne({
      status: "Active",
    });

    if (!session) {
      return res.status(200).json({
        success: true,
        session: null,
      });
    }

    const totalMembers = await DutyMember.countDocuments({
      status: true,
      availability: "Available",
    });

    const presentMembers = await DutyAttendance.countDocuments({
      session: session._id,
      status: "Present",
    });

    return res.status(200).json({
      success: true,

      session,

      stats: {
        totalMembers,
        presentMembers,
        remainingMembers:
          totalMembers - presentMembers,
      },
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });

  }
};