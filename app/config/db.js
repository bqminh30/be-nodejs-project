const mysql = require("mysql2");
const dbConfig = require("./db.config");

var connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  port: dbConfig.port,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
});
connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = connection;
