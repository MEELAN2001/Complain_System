const express = require("express")
const router = express.Router()
const complaintController = require("../controllers/complaint.controller.js")
const { isLoggedIn, isAdmin } = require("../middleware/auth.middleware.js")
const upload = require("../middleware/upload.middleware.js")

// Routes
router.get("/dashboard", isLoggedIn, complaintController.getDashboard)
router.get("/complaint/new", isLoggedIn, complaintController.getComplaintForm)
router.post("/complaint/new", isLoggedIn, upload.single("image"), complaintController.create)
router.get("/complaint/success", isLoggedIn, complaintController.getComplaintSuccess)
router.get("/complaint/:id", isLoggedIn, complaintController.getComplaintDetails)
router.post("/complaint/:id/status", isLoggedIn, isAdmin, complaintController.updateStatus)
router.post("/complaint/:id/update", isLoggedIn, isAdmin, complaintController.addUpdate)

module.exports = router
