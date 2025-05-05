const mysql = require("mysql2")
const dbConfig = require("../config/db.config.js")

// Create a connection to the database
const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
})

// Open the MySQL connection
connection.connect((error) => {
  if (error) throw error
  console.log("Successfully connected to the database.")

  // Create tables if they don't exist
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `

  const createComplaintsTable = `
    CREATE TABLE IF NOT EXISTS complaints (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      category ENUM('water', 'electricity', 'roads', 'sanitation', 'public_transport', 'others') NOT NULL,
      subject VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(255),
      image_path VARCHAR(255),
      status ENUM('pending', 'in_progress', 'resolved') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `

  const createUpdatesTable = `
    CREATE TABLE IF NOT EXISTS complaint_updates (
      id INT PRIMARY KEY AUTO_INCREMENT,
      complaint_id INT NOT NULL,
      user_id INT NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `

  connection.query(createUsersTable, (err, results) => {
    if (err) throw err
    console.log("Users table created or already exists.")

    connection.query(createComplaintsTable, (err, results) => {
      if (err) throw err
      console.log("Complaints table created or already exists.")

      connection.query(createUpdatesTable, (err, results) => {
        if (err) throw err
        console.log("Complaint updates table created or already exists.")
      })
    })
  })
})

module.exports = connection
