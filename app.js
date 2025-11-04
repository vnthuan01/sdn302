const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");
const connectDB = require("./config/database");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const apartmentRoutes = require("./routes/apartment");
const residentRoutes = require("./routes/resident");
const Account = require("./models/account");

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 3600000},
  })
);

app.use(flash());

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/main");

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", authRoutes);
app.use("/", apartmentRoutes);
app.use("/", residentRoutes);

app.get("/", (req, res) => {
  res.redirect("/signin");
});

app.use((req, res) => {
  res.status(404).render("error", {
    title: "404 Not Found",
    message: "The page you are looking for does not exist",
    status: 404,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Something went wrong on the server",
    status: 500,
  });
});

const createDefaultUser = async () => {
  try {
    const userExists = await Account.findOne({us: "admin"});
    if (!userExists) {
      const user = new Account({
        us: "admin",
        pw: "123456789",
      });
      await user.save();
      console.log("Default user created");
    }
  } catch (error) {
    console.error("Error creating default user:", error);
  }
};

createDefaultUser();

module.exports = app;
