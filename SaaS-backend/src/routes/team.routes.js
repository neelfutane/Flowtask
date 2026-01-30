const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  getTeams,
  getTeamById,   
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  updateMemberRole,
} = require("../controllers/team.controller");

router.use(verifyJWT);

router.get("/", getTeams);
router.get("/:id", getTeamById);
router.post("/", createTeam);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);
router.post("/:id/members", addMember);
router.delete("/:id/members/:memberId", removeMember);
router.put("/:id/members/:memberId", updateMemberRole);

module.exports = router;
