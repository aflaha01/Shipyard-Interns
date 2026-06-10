const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const { authorizeOwnerOrAdmin } = require("../middleware/authorize");
const {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

router.use(authenticate); // all routes require auth

router.post("/", createProject);
router.get("/", listProjects);
router.get("/:id", getProject);
router.put("/:id", authorizeOwnerOrAdmin, updateProject);
router.delete("/:id", authorizeOwnerOrAdmin, deleteProject);

module.exports = router;