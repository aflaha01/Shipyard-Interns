const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { signAccess, signRefresh, verify } = require("../utils/jwt");

const refreshTokens = new Set();

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const validRoles = ["dev", "lead", "admin"];

  if (!name || !email || !password || !role)
    return res.status(400).json({ error: "All fields are required" });

  
  if (!validRoles.includes(role))
    return res.status(400).json({ error: "Invalid request" });

  try {
    const hash = bcrypt.hashSync(
      password,
      process.env.NODE_ENV === "test" ? 1 : 10
    );
    const user = await User.create({ name, email, password: hash, role });
    res.status(201).json({ message: "User registered", userId: user.id });
  } catch (err) {
  
    if (err.name === "SequelizeUniqueConstraintError")
      return res.status(409).json({ error: "Registration failed" });
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Invalid credentials" });

  try {
    const user = await User.findOne({ where: { email } });

    // Same generic message whether email missing or password wrong
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: "Invalid credentials" });

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);
    refreshTokens.add(refreshToken);

    res.json({ accessToken, refreshToken });
  } catch {
    res.status(500).json({ error: "Unauthorized" });
  }
};

exports.refresh = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.has(refreshToken))
    return res.status(401).json({ error: "Unauthorized" });

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
    res.status(401).json({ error: "Unauthorized" });
  }
};

exports.logout = (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens.delete(refreshToken);
  res.json({ message: "Logged out successfully" });
};