const express = require("express");
const router = express.Router();
const Account = require("../models/account");
const auth = require("../middlewares/auth");

router.post("/api/login", async (req, res) => {
  try {
    const {us, pw} = req.body;

    const user = await Account.findOne({us});
    if (!user) {
      return res.status(401).json({message: "Invalid username or password"});
    }

    const isMatch = await user.comparePassword(pw);
    if (!isMatch) {
      return res.status(401).json({message: "Invalid username or password"});
    }

    const token = auth.generateToken(user._id);
    res.json({token, user: {id: user._id, username: user.us}});
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message});
  }
});

router.get("/signin", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/view/residents");
  }
  res.render("login", {title: "Sign In", messages: req.flash()});
});

router.post("/login", async (req, res) => {
  try {
    const {us, pw} = req.body;

    const user = await Account.findOne({us});
    if (!user) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/signin");
    }

    const isMatch = await user.comparePassword(pw);
    if (!isMatch) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/signin");
    }

    req.session.userId = user._id;
    res.redirect("/view/residents");
  } catch (error) {
    req.flash("error", "Login failed. Please try again.");
    res.redirect("/signin");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/signin");
  });
});

module.exports = router;
