require('dotenv').config()
const mysql = require("mysql2");

var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000

});

connection.connect(function (err) {
  if (err) {
    console.log("Error connecting to the database: " + err);
  } else {
    console.log("Connected to the database");
  }
});

module.exports = connection;
