const express = require("express")
const router = express.Router()
const { check } = require("express-validator")
const authController = require("../controllers/auth.controller.js")
const { isNotLoggedIn } = require("../middleware/auth.middleware.js")

// Register validation
const registerValidation = [
  check("username", "Username is required").notEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  check("password2").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match")
    }
    return true
  }),
  check("first_name", "First name is required").notEmpty(),
  check("last_name", "Last name is required").notEmpty(),
]

// Routes
router.get("/login", isNotLoggedIn, authController.getLogin)
router.post("/login", isNotLoggedIn, authController.login)
router.get("/register", isNotLoggedIn, authController.getRegister)
router.post("/register", isNotLoggedIn, registerValidation, authController.register)
router.get("/logout", authController.logout)

module.exports = router
