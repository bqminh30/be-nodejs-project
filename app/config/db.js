const mysql = require("mysql2");

var connection = mysql.createConnection({
  // host: "sql.freedb.tech",
  // port: "3306",
  // user: "freedb_quangminh",
  // password: "9ksDR8#HG?eBRF*",
  // database: "freedb_bookingdb",
  host: "localhost",
  port: "3307",
  user: "admin",
  password: "",
  database: "booking",
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
