const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const methodOverride = require("method-override")
const User = require("./models/user.model.js")
require("dotenv").config()

// Initialize app
const app = express()

// View engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")))

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  }),
)

// Passport configuration
app.use(passport.initialize())
app.use(passport.session())

// Flash messages
app.use(flash())

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success")
  res.locals.error_msg = req.flash("error")
  res.locals.error = req.flash("error")
  res.locals.user = req.user || null
  next()
})

// Passport Local Strategy
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findByUsername(username, async (err, user) => {
      if (err) return done(err)
      if (!user) return done(null, false, { message: "Incorrect username." })

      // Check password
      const isMatch = await User.comparePassword(password, user.password)
      if (!isMatch) return done(null, false, { message: "Incorrect password." })

      return done(null, user)
    })
  }),
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

// Routes
app.use("/", require("./routes/auth.routes.js"))
app.use("/", require("./routes/complaint.routes.js"))

// Home route
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard")
  }
  res.render("index")
})

// 404 route
app.use((req, res) => {
  res.status(404).render("404")
})

module.exports = app
