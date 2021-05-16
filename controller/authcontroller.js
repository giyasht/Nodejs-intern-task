const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel.js");

exports.protectAccess = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (req.cookies.jwt) token = req.cookies.jwt;
  //   console.log(token);
  if (!token) {
    return next(res.redirect("/login"));
  }

  // 2) validate if Token is valid
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //   console.log(decoded);

  // 3) Check if User still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(res.redirect("/login"));
  }

  // GRANT ACCESS TO PROTECTED ROUTES
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
};
