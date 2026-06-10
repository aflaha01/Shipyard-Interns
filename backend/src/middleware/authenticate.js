const { verify } = require("../utils/jwt");

module.exports = function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "Missing or invalid token" });

  const token = authHeader.split(" ")[1];
  try {
    req.user = verify(token);
    next();
  } catch (err) {
    const msg =
      err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    res.status(401).json({ error: msg });
  }
};