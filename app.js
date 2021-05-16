var bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  express = require("express"),
  app = express(),
  dotenv = require("dotenv"),
  cookieParser = require("cookie-parser"),
  methodOverride = require("method-override"),
  expressSanitizer = require("express-sanitizer"); //sanitize removes script tages


var Blog = require("./models/blogModel.js");
var User = require("./models/userModel.js");

var userRoutes = require('./routes/userRoutes.js');
var blogRoutes = require('./routes/blogRoutes.js');

mongoose
  .connect("mongodb://localhost/blogapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Database successfully connected."));

dotenv.config({ path: `${__dirname}/config.env` });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(cookieParser());

app.get("/", (req, res) => {
  if (req.user) {
    res.redirect("/blogs", { user: req.user });
  } else {
    res.redirect("/login");
  }
});

app.use("/",userRoutes);
app.use("/blogs",blogRoutes);

var port = process.env.PORT || 3010;

app.listen(port, (req, res) => {
  console.log("Server started at port " + port);
});
