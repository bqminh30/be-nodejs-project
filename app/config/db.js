const mysql = require("mysql2");

var connection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  
});
connection.getConnection((err, conn) => {
  if(err) console.log(err)
  console.log('Connection successfully')
});

module.exports = connection.promise();