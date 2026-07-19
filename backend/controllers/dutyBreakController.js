import DutyBreak from "../models/DutyBreak.js";
import DutyMember from "../models/DutyMember.js";

export const toggleBreak = async (req, res) => {
  try {
    const { memberCode } = req.body;

    if (!memberCode?.trim()) {
      return res.status(400).json({
        success: false,

        message: "Member Code is required.",
      });
    }

    // Find Member

    const member = await DutyMember.findOne({
      memberCode: memberCode.trim(),

      status: true,
      availability: "Available",
    });

    if (!member) {
      return res.status(404).json({
        success: false,

        message: "Member not found.",
      });
    }

    // Check Active Break

    const activeBreak = await DutyBreak.findOne({
      member: member._id,

      breakIn: null,
    });

    // -------------------------
    // BREAK IN
    // -------------------------

    if (activeBreak) {
      activeBreak.breakIn = new Date();

      activeBreak.duration = Math.round(
        (activeBreak.breakIn - activeBreak.breakOut) / (1000 * 60),
      );

      await activeBreak.save();

      return res.status(200).json({
        success: true,

        type: "BreakIn",

        message: `${member.name} returned from break in ${activeBreak.duration} minutes.`,

        duration: activeBreak.duration,

        break: activeBreak,
      });
    }

    // -------------------------
    // BREAK OUT
    // -------------------------

    const newBreak = await DutyBreak.create({
      member: member._id,

      breakOut: new Date(),
    });

    return res.status(201).json({
      success: true,

      type: "BreakOut",

      message: `${member.name} started break.`,

      break: newBreak,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: "Internal Server Error.",
    });
  }
};

export const getLiveBreaks = async (req, res) => {
  try {
    // All active breaks
    const activeBreaks = await DutyBreak.find({
      breakIn: null,
    })
      .populate("member", "name memberCode")
      .sort({ breakOut: 1 });

    const now = new Date();

    const breaks = activeBreaks.map((item) => {
      const totalMinutes = Math.floor((now - item.breakOut) / (1000 * 60));

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return {
        _id: item._id,
        memberId: item.member._id,
        memberCode: item.member.memberCode,
        name: item.member.name,
        breakOut: item.breakOut,
        duration: totalMinutes,
        durationText: hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`,
      };
    });

    const totalMembers = await DutyMember.countDocuments({
      status: true,
      availability: "Available",
    });

    return res.status(200).json({
      success: true,

      breaks,

      stats: {
        totalMembers,

        onBreak: breaks.length,

        available: totalMembers - breaks.length,
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

export const getBreakHistory = async (req, res) => {
  try {
    const { date } = req.query;

    let filter = {
      breakIn: { $ne: null },
    };

    // Optional Date Filter
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      filter.breakOut = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const breaks = await DutyBreak.find(filter)
      .populate("member", "name memberCode")
      .sort({ breakOut: -1 });

    const history = breaks.map((item) => ({
      _id: item._id,

      memberId: item.member._id,

      memberCode: item.member.memberCode,

      name: item.member.name,

      breakOut: item.breakOut,

      breakIn: item.breakIn,

      duration: item.duration,

      reason: item.reason,
    }));

    return res.status(200).json({
      success: true,

      count: history.length,

      breaks: history,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: "Internal Server Error.",
    });
  }
};

export const getMemberBreakHistory = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await DutyMember.findById(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    const breaks = await DutyBreak.find({
      member: memberId,
    }).sort({
      breakOut: -1,
    });

    let totalBreakMinutes = 0;

    const history = breaks.map((item) => {
      totalBreakMinutes += item.duration || 0;

      return {
        _id: item._id,

        breakOut: item.breakOut,

        breakIn: item.breakIn,

        duration: item.duration,

        reason: item.reason,
      };
    });

    const hours = Math.floor(totalBreakMinutes / 60);

    const minutes = totalBreakMinutes % 60;

    return res.status(200).json({
      success: true,

      member: {
        _id: member._id,

        name: member.name,

        memberCode: member.memberCode,

        mobile: member.mobile,
      },

      totalBreakMinutes,

      totalBreakTime: hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`,

      breaks: history,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: "Internal Server Error.",
    });
  }
};

export const closeAllBreaks = async (req, res) => {
  try {
    const activeBreaks = await DutyBreak.find({
      breakIn: null,
    });

    if (!activeBreaks.length) {
      return res.status(200).json({
        success: true,
        message: "No active breaks found.",
      });
    }

    const now = new Date();

    let updated = 0;

    for (const item of activeBreaks) {
      item.breakIn = now;

      item.duration = Math.round((now - item.breakOut) / (1000 * 60));

      await item.save();

      updated++;
    }

    return res.status(200).json({
      success: true,

      message: `${updated} active break(s) closed successfully.`,

      closed: updated,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: "Internal Server Error.",
    });
  }
};

export const deleteBreak = async (req, res) => {
  try {
    const { breakId } = req.params;

    const breakRecord = await DutyBreak.findById(breakId);

    if (!breakRecord) {
      return res.status(404).json({
        success: false,
        message: "Break record not found.",
      });
    }

    await DutyBreak.findByIdAndDelete(breakId);

    return res.status(200).json({
      success: true,

      message: "Break deleted successfully.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: "Internal Server Error.",
    });
  }
};

export const getBreakReports = async (req, res) => {
  try {
    const breaks = await DutyBreak.find({
      breakIn: { $ne: null },
    })
      .populate("member", "name memberCode")
      .sort({ breakOut: -1 });

    const reportMap = {};

    breaks.forEach((item) => {
      const d = new Date(item.breakOut);

      const dateKey =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");

      if (!reportMap[dateKey]) {
        reportMap[dateKey] = {
          date: dateKey,

          displayDate: d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),

          breakCount: 0,

          members: new Set(),

          totalDuration: 0,

          longestBreak: 0,
        };
      }

      reportMap[dateKey].breakCount++;

      reportMap[dateKey].members.add(item.member._id.toString());

      reportMap[dateKey].totalDuration += item.duration || 0;

      if (item.duration > reportMap[dateKey].longestBreak) {
        reportMap[dateKey].longestBreak = item.duration;
      }
    });

    const reports = Object.values(reportMap).map((item) => ({
      date: item.date,

      displayDate: item.displayDate,

      breakCount: item.breakCount,

      memberCount: item.members.size,

      averageDuration:
        item.breakCount === 0
          ? 0
          : Math.round(item.totalDuration / item.breakCount),

      longestBreak: item.longestBreak,
    }));

    reports.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json({
      success: true,

      reports,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: "Internal Server Error.",
    });
  }
};

export const getBreakReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,

        message: "Date is required.",
      });
    }

    const startDate = new Date(date);

    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);

    endDate.setHours(23, 59, 59, 999);

    const breaks = await DutyBreak.find({
      breakOut: {
        $gte: startDate,

        $lte: endDate,
      },

      breakIn: {
        $ne: null,
      },
    })
      .populate("member", "name memberCode mobile")
      .sort({
        breakOut: 1,
      });

    const memberMap = {};

    breaks.forEach((item) => {
      const id = item.member._id.toString();

      if (!memberMap[id]) {
        memberMap[id] = {
          memberId: item.member._id,

          memberCode: item.member.memberCode,

          name: item.member.name,

          mobile: item.member.mobile,

          totalDuration: 0,

          breakCount: 0,

          breaks: [],
        };
      }

      memberMap[id].breakCount++;

      memberMap[id].totalDuration += item.duration;

      memberMap[id].breaks.push({
        breakOut: item.breakOut,

        breakIn: item.breakIn,

        duration: item.duration,

        reason: item.reason,
      });
    });

    const members = Object.values(memberMap)
      .map((item) => ({
        ...item,

        totalBreakText:
          item.totalDuration >= 60
            ? `${Math.floor(item.totalDuration / 60)}h ${
                item.totalDuration % 60
              }m`
            : `${item.totalDuration} min`,
      }))
      .sort((a, b) => b.totalDuration - a.totalDuration);

    return res.status(200).json({
      success: true,

      displayDate: startDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),

      totalMembers: members.length,

      totalBreaks: breaks.length,

      averageBreak:
        breaks.length === 0
          ? 0
          : Math.round(
              breaks.reduce((sum, item) => sum + item.duration, 0) /
                breaks.length,
            ),

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
