const Team = require("../models/team.model");
const User = require("../models/user.model");
const Project = require("../models/project.model");

// Helper to format user
const formatUser = (user, role = "Member") => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  initials: user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
  color: user.color || "#3B82F6",
  role,
});

// Get all teams for user
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { "members.user": req.user._id },
      ],
    })
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .sort({ createdAt: -1 });

    // Get project counts for each team
    const teamsWithCounts = await Promise.all(
      teams.map(async (team) => {
        const memberIds = [team.owner._id, ...team.members.map(m => m.user._id)];
        const projectCount = await Project.countDocuments({
          $or: [
            { owner: { $in: memberIds } },
            { "members.user": { $in: memberIds } },
          ],
        });

        return {
          _id: team._id,
          name: team.name,
          description: team.description,
          owner: formatUser(team.owner, "Owner"),
          members: team.members.map(m => formatUser(m.user, m.role)),
          projectCount,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
        };
      })
    );

    res.json({ success: true, teams: teamsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get team by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    const memberIds = [team.owner._id, ...team.members.map(m => m.user._id)];
    const projectCount = await Project.countDocuments({
      $or: [
        { owner: { $in: memberIds } },
        { "members.user": { $in: memberIds } },
      ],
    });

    res.json({
      success: true,
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
        owner: formatUser(team.owner, "Owner"),
        members: team.members.map(m => formatUser(m.user, m.role)),
        projectCount,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create team
exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      owner: req.user._id,
      members: [],
    });

    await team.populate("owner", "name email");

    res.status(201).json({
      success: true,
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
        owner: formatUser(team.owner, "Owner"),
        members: [],
        projectCount: 0,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update team
exports.updateTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name, description },
      { new: true }
    )
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found or not authorized" });
    }

    res.json({
      success: true,
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
        owner: formatUser(team.owner, "Owner"),
        members: team.members.map(m => formatUser(m.user, m.role)),
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found or not authorized" });
    }

    res.json({ success: true, message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add member to team
exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only owner can add members" });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isAlreadyMember = team.members.some(
      m => m.user.toString() === userToAdd._id.toString()
    );
    if (isAlreadyMember || team.owner.toString() === userToAdd._id.toString()) {
      return res.status(400).json({ success: false, message: "User is already a team member" });
    }

    team.members.push({ user: userToAdd._id, role: role || "Member" });
    await team.save();

    await team.populate("owner", "name email");
    await team.populate("members.user", "name email");

    res.json({
      success: true,
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
        owner: formatUser(team.owner, "Owner"),
        members: team.members.map(m => formatUser(m.user, m.role)),
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove member from team
exports.removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only owner can remove members" });
    }

    team.members = team.members.filter(
      m => m.user.toString() !== req.params.memberId
    );
    await team.save();

    await team.populate("owner", "name email");
    await team.populate("members.user", "name email");

    res.json({
      success: true,
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
        owner: formatUser(team.owner, "Owner"),
        members: team.members.map(m => formatUser(m.user, m.role)),
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update member role
exports.updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only owner can update roles" });
    }

    const member = team.members.find(
      m => m.user.toString() === req.params.memberId
    );
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    member.role = role;
    await team.save();

    await team.populate("owner", "name email");
    await team.populate("members.user", "name email");

    res.json({
      success: true,
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
        owner: formatUser(team.owner, "Owner"),
        members: team.members.map(m => formatUser(m.user, m.role)),
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
