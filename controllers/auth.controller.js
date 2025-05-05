const User = require("../models/user.model.js")
const passport = require("passport")
const { validationResult } = require("express-validator")

// Register controller
exports.register = (req, res) => {
  // Check validation errors
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render("register", {
      errors: errors.array(),
      user: req.body,
    })
  }

  // Check if username already exists
  User.findByUsername(req.body.username, (err, data) => {
    if (err && err.kind !== "not_found") {
      req.flash("error", "Something went wrong. Please try again.")
      return res.redirect("/register")
    }

    if (data) {
      req.flash("error", "Username already exists")
      return res.render("register", { user: req.body })
    }

    // Check if email already exists
    User.findByEmail(req.body.email, (err, data) => {
      if (err && err.kind !== "not_found") {
        req.flash("error", "Something went wrong. Please try again.")
        return res.redirect("/register")
      }

      if (data) {
        req.flash("error", "Email already exists")
        return res.render("register", { user: req.body })
      }

      // Create new user
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
      })

      User.create(newUser, (err, data) => {
        if (err) {
          req.flash("error", "Something went wrong. Please try again.")
          return res.redirect("/register")
        }

        req.flash("success", "You are now registered and can log in")
        res.redirect("/login")
      })
    })
  })
}

// Login controller
exports.login = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next)
}

// Logout controller
exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    req.flash("success", "You are logged out")
    res.redirect("/login")
  })
}

// Get login page
exports.getLogin = (req, res) => {
  res.render("login")
}

// Get register page
exports.getRegister = (req, res) => {
  res.render("register", { user: {} })
}
