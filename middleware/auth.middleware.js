module.exports = {
  // Check if user is logged in
  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash("error", "You must be logged in to view this page")
    res.redirect("/login")
  },

  // Check if user is an admin
  isAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next()
    }
    req.flash("error", "You do not have permission to view this page")
    res.redirect("/")
  },

  // Check if user is not logged in (for login/register pages)
  isNotLoggedIn: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next()
    }
    res.redirect("/dashboard")
  },
}
