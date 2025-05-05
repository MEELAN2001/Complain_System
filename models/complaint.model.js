const sql = require("./db.js")

// Constructor
const Complaint = function (complaint) {
  this.user_id = complaint.user_id
  this.category = complaint.category
  this.subject = complaint.subject
  this.description = complaint.description
  this.location = complaint.location
  this.image_path = complaint.image_path
  this.status = complaint.status || "pending"
}

// Create a new complaint
Complaint.create = (newComplaint, result) => {
  sql.query("INSERT INTO complaints SET ?", newComplaint, (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }

    console.log("created complaint: ", { id: res.insertId, ...newComplaint })
    result(null, { id: res.insertId, ...newComplaint })
  })
}

// Find complaint by ID
Complaint.findById = (complaintId, result) => {
  sql.query(
    `
    SELECT c.*, u.username, u.first_name, u.last_name 
    FROM complaints c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `,
    [complaintId],
    (err, res) => {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found complaint: ", res[0])

        // Get updates for this complaint
        sql.query(
          `
        SELECT cu.*, u.username, u.first_name, u.last_name 
        FROM complaint_updates cu
        JOIN users u ON cu.user_id = u.id
        WHERE cu.complaint_id = ?
        ORDER BY cu.created_at DESC
      `,
          [complaintId],
          (updateErr, updateRes) => {
            if (updateErr) {
              console.log("error getting updates: ", updateErr)
              result(updateErr, null)
              return
            }

            const complaint = res[0]
            complaint.updates = updateRes

            result(null, complaint)
          },
        )
        return
      }

      // Complaint with the id not found
      result({ kind: "not_found" }, null)
    },
  )
}

// Get all complaints
Complaint.getAll = (params, result) => {
  let query = `
    SELECT c.*, u.username, u.first_name, u.last_name 
    FROM complaints c
    JOIN users u ON c.user_id = u.id
  `

  // Add filters if provided
  const conditions = []
  const values = []

  if (params.status) {
    conditions.push("c.status = ?")
    values.push(params.status)
  }

  if (params.user_id) {
    conditions.push("c.user_id = ?")
    values.push(params.user_id)
  }

  if (params.search) {
    conditions.push("(c.subject LIKE ? OR c.description LIKE ? OR u.username LIKE ?)")
    const searchTerm = `%${params.search}%`
    values.push(searchTerm, searchTerm, searchTerm)
  }

  if (conditions.length) {
    query += " WHERE " + conditions.join(" AND ")
  }

  // Add ordering
  query += " ORDER BY c.created_at DESC"

  sql.query(query, values, (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }

    console.log("complaints: ", res)
    result(null, res)
  })
}

// Update complaint status
Complaint.updateStatus = (id, status, result) => {
  sql.query("UPDATE complaints SET status = ? WHERE id = ?", [status, id], (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }

    if (res.affectedRows == 0) {
      // Not found complaint with the id
      result({ kind: "not_found" }, null)
      return
    }

    console.log("updated complaint status: ", { id: id, status: status })
    result(null, { id: id, status: status })
  })
}

// Add update to complaint
Complaint.addUpdate = (update, result) => {
  sql.query("INSERT INTO complaint_updates SET ?", update, (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }

    console.log("created complaint update: ", { id: res.insertId, ...update })

    // Get the created update with user details
    sql.query(
      `
      SELECT cu.*, u.username, u.first_name, u.last_name 
      FROM complaint_updates cu
      JOIN users u ON cu.user_id = u.id
      WHERE cu.id = ?
    `,
      [res.insertId],
      (err, updateRes) => {
        if (err) {
          console.log("error getting created update: ", err)
          result(err, null)
          return
        }

        result(null, updateRes[0])
      },
    )
  })
}

// Delete complaint by ID
Complaint.remove = (id, result) => {
  sql.query("DELETE FROM complaints WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }

    if (res.affectedRows == 0) {
      // Not found complaint with the id
      result({ kind: "not_found" }, null)
      return
    }

    console.log("deleted complaint with id: ", id)
    result(null, res)
  })
}

module.exports = Complaint
