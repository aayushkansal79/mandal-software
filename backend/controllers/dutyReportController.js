import DutySession from "../models/DutySession.js";
import DutyMember from "../models/DutyMember.js";
import DutyAttendance from "../models/DutyAttendance.js";

export const getAllReports = async (req, res) => {
    try {

        const sessions = await DutySession.find({
            status: "Completed"
        }).sort({
            startTime: -1
        });

        if (!sessions.length) {
            return res.status(200).json({
                success: true,
                reports: []
            });
        }

        const memberCount = await DutyMember.countDocuments({
            status: true
        });

        const reportMap = {};

        sessions.forEach((session) => {

            // Use START TIME for grouping
            const d = new Date(session.startTime);

            const dateKey =
                d.getFullYear() +
                "-" +
                String(d.getMonth() + 1).padStart(2, "0") +
                "-" +
                String(d.getDate()).padStart(2, "0");

            if (!reportMap[dateKey]) {

                reportMap[dateKey] = {

                    date: dateKey,

                    sessionCount: 0,

                    totalPresent: 0,

                    totalAbsent: 0,

                    totalLeave: 0,

                    memberCount,

                    lastSession: session.endTime || session.startTime

                };

            }

            reportMap[dateKey].sessionCount++;

            reportMap[dateKey].totalPresent += session.presentCount || 0;

            reportMap[dateKey].totalAbsent += session.absentCount || 0;

            reportMap[dateKey].totalLeave += session.leaveCount || 0;

            const currentLast = reportMap[dateKey].lastSession;

            const newLast = session.endTime || session.startTime;

            if (new Date(newLast) > new Date(currentLast)) {

                reportMap[dateKey].lastSession = newLast;

            }

        });

        const reports = Object.values(reportMap).map((report) => {

            const displayDate = new Date(
                report.date + "T00:00:00"
            ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });

            return {

                date: report.date,

                displayDate,

                sessionCount: report.sessionCount,

                memberCount: report.memberCount,

                averagePresent: Math.round(
                    report.totalPresent /
                    report.sessionCount
                ),

                averageAbsent: Math.round(
                    report.totalAbsent /
                    report.sessionCount
                ),

                averageLeave: Math.round(
                    report.totalLeave /
                    report.sessionCount
                ),

                lastSessionTime: new Date(
                    report.lastSession
                ).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit"
                })

            };

        });

        reports.sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );

        return res.status(200).json({

            success: true,

            reports

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });

    }
};

export const getDayReport = async (req, res) => {
    try {

        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required."
            });
        }

        // Start & End of selected day
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        // Get all completed sessions of that day
        const sessions = await DutySession.find({
            startTime: {
                $gte: startDate,
                $lte: endDate
            },
            status: "Completed"
        }).sort({
            startTime: 1
        });

        if (!sessions.length) {
            return res.status(404).json({
                success: false,
                message: "No sessions found."
            });
        }

        const sessionIds = sessions.map(session => session._id);

        // Active Members
        const members = await DutyMember.find({
            status: true
        }).sort({
            memberCode: 1
        });

        // Attendance Records
        const attendanceRecords = await DutyAttendance.find({
            session: {
                $in: sessionIds
            }
        })
            .populate("member", "_id")
            .lean();

        // Attendance Map
        const attendanceMap = {};

        attendanceRecords.forEach(record => {

            const memberId = record.member._id.toString();

            const sessionId = record.session.toString();

            if (!attendanceMap[memberId]) {

                attendanceMap[memberId] = {};

            }

            attendanceMap[memberId][sessionId] = {

                status: record.status,

                attendanceTime: record.attendanceTime

            };

        });

        // Build Matrix
        const reportMembers = members.map(member => {

            const attendance = {};

            let presentCount = 0;

            let leaveCount = 0;

            let expectedSessions = sessions.length;

            sessions.forEach(session => {

                const sessionAttendance =
                    attendanceMap[
                        member._id.toString()
                    ]?.[
                        session._id.toString()
                    ];

                if (sessionAttendance) {

                    attendance[session._id.toString()] = sessionAttendance;

                    if (sessionAttendance.status === "Present") {

                        presentCount++;

                    }

                    if (sessionAttendance.status === "Leave") {

                        leaveCount++;

                        expectedSessions--;

                    }

                } else {

                    attendance[session._id.toString()] = {

                        status: "Absent",

                        attendanceTime: null

                    };

                }

            });

            return {

                _id: member._id,

                memberCode: member.memberCode,

                name: member.name,

                attendance,

                presentCount,

                leaveCount,

                attendancePercentage:
                    expectedSessions === 0
                        ? null
                        : Number(
                            (
                                (presentCount /
                                    expectedSessions) *
                                100
                            ).toFixed(1)
                        )

            };

        });

        return res.status(200).json({

            success: true,

            date,

            displayDate: startDate.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            ),

            sessions: sessions.map(session => ({

                _id: session._id,

                title: session.title,

                startTime: session.startTime.toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                ),

                endTime: session.endTime
                    ? session.endTime.toLocaleTimeString(
                        "en-IN",
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    )
                    : "-",

                presentCount: session.presentCount || 0,

                absentCount: session.absentCount || 0,

                leaveCount: session.leaveCount || 0

            })),

            members: reportMembers

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });

    }
};