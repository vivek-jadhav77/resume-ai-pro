const Report = require("../models/Report");
const User = require("../models/User");

// @desc    Get production analytics and statistics
// @route   GET /api/analytics
// @access  Private (Admin only in real-world, allowing for demo purposes)
exports.getAnalytics = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const totalUsers = await User.countDocuments();

    // Aggregate average ATS score and confidence
    const averages = await Report.aggregate([
      {
        $group: {
          _id: null,
          avgAtsScore: { $avg: "$atsScore" },
          avgConfidence: { $avg: "$confidence" }
        }
      }
    ]);

    // Aggregate most common detected roles
    const popularRoles = await Report.aggregate([
      { $group: { _id: "$roleDetected", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // We can also aggregate most missing skills, but let's keep it simple for now
    const missingSkillsRaw = await Report.aggregate([
      { $unwind: "$criticalMissingSkills" },
      { $group: { _id: "$criticalMissingSkills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalReports,
      totalUsers,
      averageAtsScore: averages[0]?.avgAtsScore ? Math.round(averages[0].avgAtsScore) : 0,
      averageConfidence: averages[0]?.avgConfidence ? Math.round(averages[0].avgConfidence) : 0,
      popularRoles: popularRoles.map(r => ({ role: r._id, count: r.count })),
      topMissingSkills: missingSkillsRaw.map(s => ({ skill: s._id, count: s.count }))
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
