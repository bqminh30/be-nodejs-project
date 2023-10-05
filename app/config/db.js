const mysql = require("mysql2");

var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  
});
connection.connect(function (err) {
  if (err) {
    console.log( err);
  }
});

module.exports = connection;