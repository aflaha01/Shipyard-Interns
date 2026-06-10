const { Project } = require("../models");

exports.createProject = async (req, res) => {
  const { name, description, status } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  try {
    const project = await Project.create({
      name,
      description: description || "",
      owner_id: req.user.id,
      status: status || "active",
    });
    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: "Failed to create project" });
  }
};

exports.listProjects = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Project.findAndCountAll({ limit, offset });
    res.json({ page, limit, total: count, data: rows });
  } catch {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch {
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

exports.updateProject = async (req, res) => {
  const { name, description, status } = req.body;
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    await project.update({ name, description, status });
    res.json({ message: "Project updated" });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    await project.destroy();
    res.json({ message: "Project deleted" });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
};