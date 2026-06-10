const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { signAccess, signRefresh, verify } = require("../utils/jwt");

const refreshTokens = new Set();

exports.register = (req, res) => {
  const { name, email, password, role } = req.body;
  const validRoles = ["dev", "lead", "admin"];

  if (!name || !email || !password || !role)
    return res.status(400).json({ error: "All fields are required" });
  if (!validRoles.includes(role))
    return res
      .status(400)
      .json({ error: "Role must be one of: dev, lead, admin" });

  const hash = bcrypt.hashSync(password, 10);
  db.run(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hash, role],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE"))
          return res.status(409).json({ error: "Email already registered" });
        return res.status(500).json({ error: "Registration failed" });
      }
      res.status(201).json({ message: "User registered", userId: this.lastID });
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: "Login failed" });
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: "Invalid credentials" });

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);
    refreshTokens.add(refreshToken);

    res.json({ accessToken, refreshToken });
  });
};

exports.refresh = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.has(refreshToken))
    return res.status(401).json({ error: "Invalid refresh token" });

  try {
    const payload = verify(refreshToken);
    const newAccess = signAccess({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });
    res.json({ accessToken: newAccess });
  } catch {
    refreshTokens.delete(refreshToken);
    res.status(401).json({ error: "Refresh token expired, please login again" });
  }
};

exports.logout = (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens.delete(refreshToken);
  res.json({ message: "Logged out successfully" });
};