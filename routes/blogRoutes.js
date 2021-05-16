var express = require("express"),
  router = express.Router(),
  authController = require("./../controller/authcontroller");

const User = require("./../models/userModel.js");
const Blog = require("./../models/blogModel.js");

//RESTFUL ROUTES
router.get("/", authController.protectAccess, (req, res) => {
  Blog.find({}, (err, allBlogs) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", { blogs: allBlogs, user: req.user });
    }
  });
});

router.get("/new", authController.protectAccess, function (req, res) {
  res.render("new", { user: req.user });
});

//CREATE ROUTE
router.post("/", authController.protectAccess, (req, res) => {
  // console.log(req.body)
  req.body.blog.body = req.sanitize(req.body.blog.body);
  req.body.blog.author = req.user.username;
  // console.log(req.body)
  Blog.create(req.body.blog, function (err, newBlog) {
    if (err) {
      res.render("new", { user: req.user });
    } else {
      res.redirect("/blogs");
    }
  });
});

router.get("/:id", authController.protectAccess, (req, res) => {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("show", { blog: foundBlog, user: req.user });
    }
  });
});

router.get("/:id/edit", authController.protectAccess, function (req, res) {
  Blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", { blog: foundBlog, user: req.user });
    }
  });
});

//UPDATE ROUTE
router.put("/:id", authController.protectAccess, function (req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

//DELETE ROUTE
router.delete("/:id", authController.protectAccess, (req, res) => {
  //destroy blog
  Blog.findByIdAndRemove(req.params.id, function (err) {
    //redirect somewhere
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});

router.post("/searchresults", authController.protectAccess, (req, res) => {
  var title = req.body.searchblog;
  Blog.find({ title: { $regex: new RegExp(title) } }, (err, searchedBlogs) => {
    if (err) {
      console.log(err);
    } else {
      res.render("searchedblogs", {
        searchedBlogs: searchedBlogs,
        user: req.user,
      });
    }
  });
});

module.exports = router;
