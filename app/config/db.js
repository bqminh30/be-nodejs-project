const mysql = require("mysql2");

var connection = mysql.createConnection({
  // host: "45.32.111.92",
  // port: "3306",
  // user: "bqminh",
  // password: "6yhs3pBMFAcdB4LL",
  // database: "bqminh",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
connection.connect(function (err) {
  if (err) {
    console.log(err);
  }
});

module.exports = connection;
