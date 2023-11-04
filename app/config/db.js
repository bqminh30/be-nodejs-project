const mysql = require("mysql2");

var connection = mysql.createConnection({
  host: 'sql.freedb.tech',
  port: '3306',
  user: 'freedb_quangminh',
  password: '9ksDR8#HG?eBRF*',
  database: 'freedb_bookingdb',
//   DB_HOST=sql.freedb.tech
// DB_DATABASE_NAME=freedb_bookingdb
// DB_USERNAME=freedb_quangminh
// DB_PASSWORD="9ksDR8#HG?eBRF*"
// DB_PORT=3306
// DB_DIALECT=mysql
});
connection.connect(function (err) {
  if (err) {
    console.log( err);
  }
});

module.exports = connection;