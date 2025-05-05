const Complaint = require("../models/complaint.model.js")

// Create a new complaint
exports.create = (req, res) => {
  // Validate request
  if (!req.body.category || !req.body.subject || !req.body.description) {
    req.flash("error", "Please fill all required fields")
    return res.redirect("/complaint/new")
  }

  // Create a Complaint
  const complaint = new Complaint({
    user_id: req.user.id,
    category: req.body.category,
    subject: req.body.subject,
    description: req.body.description,
    location: req.body.location || null,
    image_path: req.file ? `/uploads/${req.file.filename}` : null,
  })

  // Save Complaint in the database
  Complaint.create(complaint, (err, data) => {
    if (err) {
      req.flash("error", "Something went wrong. Please try again.")
      return res.redirect("/complaint/new")
    }

    req.flash("success", "Your complaint has been submitted successfully!")
    res.redirect("/complaint/success")
  })
}

// Get complaint form page
exports.getComplaintForm = (req, res) => {
  // Get user's previous complaints
  Complaint.getAll({ user_id: req.user.id }, (err, data) => {
    if (err) {
      req.flash("error", "Something went wrong. Please try again.")
      return res.redirect("/dashboard")
    }

    res.render("user/complaint-form", {
      user_complaints: data || [],
    })
  })
}

// Get complaint success page
exports.getComplaintSuccess = (req, res) => {
  res.render("user/complaint-success")
}

// Get complaint details
exports.getComplaintDetails = (req, res) => {
  Complaint.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        req.flash("error", "Complaint not found")
        return res.redirect("/dashboard")
      }

      req.flash("error", "Something went wrong. Please try again.")
      return res.redirect("/dashboard")
    }

    // Check if user is admin or complaint owner
    if (req.user.role !== "admin" && data.user_id !== req.user.id) {
      req.flash("error", "You don't have permission to view this complaint")
      return res.redirect("/dashboard")
    }

    res.render("admin/complaint-detail", {
      complaint: data,
      isAdmin: req.user.role === "admin",
    })
  })
}

// Update complaint status
exports.updateStatus = (req, res) => {
  // Validate request
  if (!req.body.status) {
    req.flash("error", "Status is required")
    return res.redirect(`/complaint/${req.params.id}`)
  }

  Complaint.updateStatus(req.params.id, req.body.status, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        req.flash("error", "Complaint not found")
        return res.redirect("/dashboard")
      }

      req.flash("error", "Something went wrong. Please try again.")
      return res.redirect(`/complaint/${req.params.id}`)
    }

    req.flash("success", "Status updated successfully!")
    res.redirect(`/complaint/${req.params.id}`)
  })
}

// Add update to complaint
exports.addUpdate = (req, res) => {
  // Validate request
  if (!req.body.comment) {
    req.flash("error", "Comment is required")
    return res.redirect(`/complaint/${req.params.id}`)
  }

  const update = {
    complaint_id: req.params.id,
    user_id: req.user.id,
    comment: req.body.comment,
  }

  Complaint.addUpdate(update, (err, data) => {
    if (err) {
      req.flash("error", "Something went wrong. Please try again.")
      return res.redirect(`/complaint/${req.params.id}`)
    }

    req.flash("success", "Update added successfully!")
    res.redirect(`/complaint/${req.params.id}`)
  })
}

// Get dashboard
exports.getDashboard = (req, res) => {
  // Check if user is admin
  if (req.user.role === "admin") {
    // Get filter parameters
    const params = {
      status: req.query.status || "",
      search: req.query.search || "",
    }

    // Get all complaints for admin
    Complaint.getAll(params, (err, data) => {
      if (err) {
        req.flash("error", "Something went wrong. Please try again.")
        return res.redirect("/")
      }

      res.render("admin/dashboard", {
        complaints: data || [],
        status_filter: params.status,
        search_query: params.search,
      })
    })
  } else {
    // Redirect regular users to complaint form
    res.redirect("/complaint/new")
  }
}
