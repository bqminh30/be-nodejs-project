const sql = require("../config/db.js");

// constructor
const Order_Detail = function(data) {
  this.createdDate = data.createdDate;
  this.checkinDate = data.checkinDate;
  this.checkoutDate = data.checkoutDate;
  this.status =data.status;
  this.dateCount = data.dateCount;
  this.total = data.total;
  this.personCount = data.personCount;
  this.order_id = data.order_id;
  this.room_id = data.room_id;
  this.createdAt = data.createdAt;
  this.updatedAt = data.updatedAt;
};

Order_Detail.create = (newOrder_detail, result) => {
    sql.query("INSERT INTO order_detail SET ?", newOrder_detail, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
  
      console.log("created order: ", { id: res.insertId, ...newOrder_detail });
      result(null, { id: res.insertId, ...newOrder_detail });
    });
  };
Order_Detail.createOrderDetail = (detail) => {

    return new Promise((resolve, reject) => {
      //insert the order data into the "order_detail" table
      sql.query(
        "INSERT INTO order_detail (createdDate,checkinDate, checkoutDate, status, dateCount, total, personCount, order_id, room_id, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)",
            [
          new Date(),
          detail.checkinDate,
          detail.checkoutDate,
          detail.status,
          detail.dateCount,
          detail.total,
          detail.personCount,
          detail.order_id, 
          detail.room_id,
          new Date(),
        ],
        (err, res) => {
          if (err) {
            reject(`Error creating order: ${err}`);
          } else {
            resolve({id: res.insertId, ...detail});
          }
        }
      );
    });
  }
  
  module.exports = Order_Detail;