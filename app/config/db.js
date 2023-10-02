const mysql = require("mysql2");

var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  port: process.env.DB_PORT,
  password: process.env.PASSWORD,
  database: process.env.DB_DATABASE_NAME,
});
connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!", err);
});

module.exports = connection;

// const { Client } = require('pg');
// var fs = require('fs');

// const connection = new Client({
//   user: process.env.DB_PG_USERNAME,
//   // host: 'localhost',
//   database: process.env.DB_PG_DATABASE_NAME,
//   password: process.env.DB_PG_PASSWORD,
//   port: process.env.DB_PG_PORT,
//   // ssl  : {
//   //   ca : {
//   //     require: true,
//   //     rejectUnauthorized: false
//   //   }
//   // }
// })
// connection.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

module.exports = connection;