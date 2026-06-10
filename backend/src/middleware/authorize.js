// authorize(...roles) — checks role
// authorizeOwnerOrAdmin — checks project ownership OR admin role

const db = require("../config/db");

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    next();
  };

const authorizeOwnerOrAdmin = (req, res, next) => {
  const projectId = parseInt(req.params.id);
  if (req.user.role === "admin") return next();

  db.get(
    "SELECT owner_id FROM projects WHERE id = ?",
    [projectId],
    (err, row) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!row) return res.status(404).json({ error: "Project not found" });
      if (row.owner_id !== req.user.id)
        return res
          .status(403)
          .json({ error: "Forbidden: not owner or admin" });
      next();
    }
  );
};

module.exports = { authorize, authorizeOwnerOrAdmin };