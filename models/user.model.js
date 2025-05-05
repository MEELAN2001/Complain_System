const sql = require("./db.js")
const bcrypt = require("bcryptjs")

// Constructor
const User = function (user) {
  this.username = user.username
  this.email = user.email
  this.password = user.password
  this.first_name = user.first_name
  this.last_name = user.last_name
  this.role = user.role || "user"
}

// Create a new user
User.create = async (newUser, result) => {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10)
    newUser.password = await bcrypt.hash(newUser.password, salt)

    sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      console.log("created user: ", { id: res.insertId, ...newUser })
      result(null, { id: res.insertId, ...newUser })
    })
  } catch (err) {
    console.log("error: ", err)
    result(err, null)
  }
}

// Find user by ID
User.findById = (userId, result) => {
  sql.query(`SELECT * FROM users WHERE id = ${userId}`, (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }

    if (res.length) {
      console.log("found user: ", res[0])
      result(null, res[0])
      return
    }

    // User with the id not found
    result({ kind: "not_found" }, null)
  })
}

// Find user by username
User.findByUsername = (username, result) => {
  sql.query(`SELECT * FROM users WHERE username = ?`, [username], (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }

    if (res.length) {
      console.log("found user: ", res[0])
      result(null, res[0])
      return
    }

    // User with the username not found
    result({ kind: "not_found" }, null)
  })
}

// Find user by email
User.findByEmail = (email, result) => {
  sql.query(`SELECT * FROM users WHERE email = ?`, [email], (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }

    if (res.length) {
      console.log("found user: ", res[0])
      result(null, res[0])
      return
    }

    // User with the email not found
    result({ kind: "not_found" }, null)
  })
}

// Get all users
User.getAll = (result) => {
  sql.query("SELECT * FROM users", (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }

    console.log("users: ", res)
    result(null, res)
  })
}

// Update user by ID
User.updateById = (id, user, result) => {
  sql.query(
    "UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, role = ? WHERE id = ?",
    [user.username, user.email, user.first_name, user.last_name, user.role, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.affectedRows == 0) {
        // Not found user with the id
        result({ kind: "not_found" }, null)
        return
      }

      console.log("updated user: ", { id: id, ...user })
      result(null, { id: id, ...user })
    },
  )
}

// Update password
User.updatePassword = async (id, newPassword, result) => {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    sql.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id], (err, res) => {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.affectedRows == 0) {
        // Not found user with the id
        result({ kind: "not_found" }, null)
        return
      }

      console.log("updated user password: ", { id: id })
      result(null, { id: id })
    })
  } catch (err) {
    console.log("error: ", err)
    result(err, null)
  }
}

// Delete user by ID
User.remove = (id, result) => {
  sql.query("DELETE FROM users WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }

    if (res.affectedRows == 0) {
      // Not found user with the id
      result({ kind: "not_found" }, null)
      return
    }

    console.log("deleted user with id: ", id)
    result(null, res)
  })
}

// Compare password
User.comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

module.exports = User
