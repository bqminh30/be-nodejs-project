require('dotenv').config()
const mysql = require("mysql2");

function connection() {
  return new Promise((resolve, reject) => {
    let _connection = mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    _connection.connect(function (err) {
      if (err) {
        reject(err); // Khi có lỗi kết nối, reject Promise
      } else {
        console.log("Connected to the database");
        resolve(_connection); // Khi kết nối thành công, resolve Promise với kết nối
      }
    });
  });
}

module.exports = connection;
