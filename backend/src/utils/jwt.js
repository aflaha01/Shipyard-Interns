const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

const signAccess = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: ACCESS_EXPIRY });

const signRefresh = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: REFRESH_EXPIRY });

const verify = (token) => jwt.verify(token, SECRET);

module.exports = { signAccess, signRefresh, verify };