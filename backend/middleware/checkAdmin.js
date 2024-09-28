require("dotenv").config();
const jwt = require("jsonwebtoken");

const checkAdmin = async (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) {
    return res.status(401).json({ error: "Please provide a valid token" });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;

    if (req.user.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized!!" });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Admin Middleware failed" });
  }
};

module.exports = checkAdmin;
