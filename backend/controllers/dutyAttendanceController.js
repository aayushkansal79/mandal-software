import DutyAttendance from "../models/DutyAttendance.js";
import DutyMember from "../models/DutyMember.js";
import DutySession from "../models/DutySession.js";

export const markAttendance = async (req, res) => {
    try {

        const { memberCode } = req.body;

        if (!memberCode?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Member code is required."
            });
        }

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

        // Find Member
        const member = await DutyMember.findOne({
            memberCode: memberCode.trim(),
            status: true
        });

        if (!member) {
            return res.status(404).json({
              success: false,
              message: "Invalid QR Code."
            });
          }
          
          // Check Leave Status
          if (member.availability === "Leave") {
              return res.status(400).json({
                success: false,
                message: `${member.name} is on leave.`
              });
          }

        // Check Duplicate Attendance
        const alreadyMarked = await DutyAttendance.findOne({
            session: session._id,
            member: member._id
        });

        if (alreadyMarked) {
            return res.status(400).json({
                success: false,
                message: `${member.name} has already marked attendance.`,
                attendance: alreadyMarked
            });
        }

        // Mark Attendance
        const attendance = await DutyAttendance.create({
            session: session._id,
            member: member._id,
            status: "Present",
            attendanceTime: new Date()
        });

        return res.status(201).json({
            success: true,
            message: `Attendance marked for ${member.name}.`,
            attendance
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });

    }
};

export const getAttendanceBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const totalMembers = await DutyMember.countDocuments({
      status: true,
    });

    const attendance = await DutyAttendance.find({
      session: sessionId,
    })
      .populate("member", "memberCode name mobile")
      .sort({ attendanceTime: 1 });

    const statusOrder = {
      Present: 1,
      Absent: 2,
      Leave: 3,
    };

    attendance.sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }

      return (
        new Date(a.attendanceTime || 0) -
        new Date(b.attendanceTime || 0)
      );
    });

    const formattedAttendance = attendance.map((item) => ({
      _id: item._id,
      memberCode: item.member.memberCode,
      name: item.member.name,
      mobile: item.member.mobile,
      attendanceTime: item.attendanceTime,
      status: item.status,
      remarks: item.remarks,
    }));

    const present = attendance.filter(
      (item) => item.status === "Present"
    ).length;

    const absent = attendance.filter(
      (item) => item.status === "Absent"
    ).length;
    
    const leave = attendance.filter(
      (item) => item.status === "Leave"
    ).length;

    return res.status(200).json({
      success: true,

      stats: {
        total: totalMembers,
        present,
        absent,
        leave,
        remaining: totalMembers - attendance.length,
      },

      attendance: formattedAttendance,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};