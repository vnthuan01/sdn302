const jwt = require("jsonwebtoken");
const User = require("../models/account");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET;

exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, secretKey, { expiresIn: "1d" });
};

exports.authenticateApiToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = await User.findById(decoded.id).select("-pw");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

exports.authenticateSession = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      req.user = await User.findById(req.session.userId).select("-pw");
      if (!req.user) {
        req.flash("error", "Please log in to continue");
        return res.redirect("/login");
      }
      next();
    } catch (error) {
      req.flash("error", "Authentication error");
      return res.redirect("/login");
    }
  } else {
    req.flash("error", "Please log in to continue");
    return res.redirect("/login");
  }
};
