const db = require("../config/db");

exports.createProject = (req, res) => {
  const { name, description, status } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  db.run(
    "INSERT INTO projects (name, description, owner_id, status) VALUES (?, ?, ?, ?)",
    [name, description || "", req.user.id, status || "active"],
    function (err) {
      if (err) return res.status(500).json({ error: "Failed to create project" });
      res.status(201).json({ id: this.lastID, name, description, ownerId: req.user.id, status: status || "active" });
    }
  );
};

exports.listProjects = (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const offset = (page - 1) * limit;

  db.get("SELECT COUNT(*) as total FROM projects", [], (err, countRow) => {
    if (err) return res.status(500).json({ error: "Failed to fetch projects" });
    db.all(
      "SELECT * FROM projects LIMIT ? OFFSET ?",
      [limit, offset],
      (err, rows) => {
        if (err) return res.status(500).json({ error: "Failed to fetch projects" });
        res.json({ page, limit, total: countRow.total, data: rows });
      }
    );
  });
};

exports.getProject = (req, res) => {
  db.get("SELECT * FROM projects WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!row) return res.status(404).json({ error: "Project not found" });
    res.json(row);
  });
};

exports.updateProject = (req, res) => {
  const { name, description, status } = req.body;
  db.run(
    "UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description), status = COALESCE(?, status) WHERE id = ?",
    [name, description, status, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: "Update failed" });
      if (this.changes === 0) return res.status(404).json({ error: "Project not found" });
      res.json({ message: "Project updated" });
    }
  );
};

exports.deleteProject = (req, res) => {
  db.run("DELETE FROM projects WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Delete failed" });
    if (this.changes === 0) return res.status(404).json({ error: "Project not found" });
    res.json({ message: "Project deleted" });
  });
};