const sql = require("../config/db.js");
var moment = require("moment");

// constructor
const Order_Detail = function (data) {
  this.createdDate = data.createdDate;
  this.checkinDate = data.checkinDate;
  this.checkoutDate = data.checkoutDate;
  this.status = data.status;
  this.price = data.price;
  this.dateCount = data.dateCount;
  this.total = data.total;
  this.personCount = data.personCount;
  this.childrenCount = data.childrenCount;
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
  const formatCheckIn = moment(detail.checkinDate, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
  const formatCheckout = moment(detail.checkoutDate, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
  return new Promise((resolve, reject) => {
    //insert the order data into the "order_detail" table

    sql.query(
      "INSERT INTO order_detail (createdDate, checkinDate, checkoutDate, status, dateCount,price, total, personCount,childrenCount, order_id, room_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)",
      [
        new Date(),
        formatCheckIn,
        formatCheckout,
        1,
        detail.dateCount,
        detail.price,
        detail.total,
        detail.memberCount,
        detail.childrenCount,
        detail.order_id,
        detail.room_id,
        new Date(),
        new Date(),
      ],
      (err, res) => {
        if (err) {
          reject(`Error creating order: ${err}`);
        } else {
          resolve({ id: res.insertId, ...detail });
        }
      }
    );
  });
};

Order_Detail.checkOrderBooking = async (startDate, endDate, roomId) => {
  // Thực hiện câu truy vấn SQL để kiểm tra xem phòng đã được đặt trong khoảng thời gian đã chọn hay chưa
  const queryString = `
      SELECT COUNT(*) AS count
      FROM order_detail
      WHERE room_id = ? AND
            (
              (createdDate >= ? AND createdDate < ?) OR
              (checkoutDate > ? AND checkoutDate <= ?) OR
              (createdDate <= ? AND checkoutDate >= ?)
            )
    `;

  // Thực thi câu truy vấn SQL
  const results = await new Promise((resolve, reject) => {
    sql.query(
      queryString,
      [roomId, startDate, endDate, startDate, endDate, startDate, endDate],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });

  // Kết quả từ truy vấn sẽ trả về một số lượng các đơn đặt phòng trùng khớp trong khoảng thời gian đã chọn
  // Nếu số lượng lớn hơn 0, có đặt phòng trong khoảng thời gian đó, ngược lại không có
  const bookingsCount = results[0].count;
  return bookingsCount === 0;
};

module.exports = Order_Detail;
