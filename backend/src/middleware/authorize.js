const { Project } = require("../models");

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ error: "Forbidden" });
  next();
};

const authorizeOwnerOrAdmin = async (req, res, next) => {
  if (req.user.role === "admin") return next();

  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.owner_id !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });
    next();
  } catch {
    res.status(500).json({ error: "Unauthorized" });
  }
};

module.exports = { authorize, authorizeOwnerOrAdmin };