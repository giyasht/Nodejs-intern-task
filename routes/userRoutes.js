var express = require("express"),
  router = express.Router(),
  authController = require("./../controller/authcontroller");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel.js");
const Blog = require("./../models/blogModel.js");

//USER ROUTES

router.get("/login", (req, res) => {
  let token;
  if (req.cookies.jwt) token = req.cookies.jwt;
  if (!token) res.render("login.ejs");
  else res.redirect("/blogs");
});

const SignToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

router.post("/login", async (req, res) => {
  const DReq = { ...req.body };
  const username = DReq.username;
  const password = DReq.password;

  const user = await User.findOne({ username: username }).select("+password");
  if (user && user.CheckPass(password, user.password)) {
    const token = SignToken(user._id);
    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    });

    // Remove password from output
    user.password = undefined;
    res.status(200).redirect("/blogs");
  } else {
    res.redirect("/login");
  }
});

router.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

router.post("/signup", async (req, res) => {
  const newUser = await User.create({
    email: req.body.useremail,
    username: req.body.username,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = SignToken(newUser._id);
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  newUser.password = undefined;
  res.status(201).redirect("/blogs");
});

router.get("/logout", (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.redirect("/");
});

router.delete("/users/:id", authController.protectAccess, (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.redirect("/");
});

module.exports = router;
