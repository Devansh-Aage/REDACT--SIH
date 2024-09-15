require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const checkAdmin = async (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) {
    return res.status(401).json({ error: "Please provide a valid token" });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const userId = data.user.id;
    req.user=data.user;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ error: "No user found" });
    }
    if (user.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized!!" });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ error: "Admin Middleware failed" });
  }
};

module.exports = checkAdmin;
