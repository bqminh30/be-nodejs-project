const sql = require("../config/db.js");
const Order_Detail = require("./order_detail.model");

// constructor
const Orders = function (data) {
  this.createdDate = data.createdDate;
  this.count = data.count;
  this.status = data.status;
  this.total = data.total;
  this.note = data.note;
  this.customer_id = data.customer_id;
  this.employee_id = data.employee_id;
  this.createdAt = data.createdAt;
  this.updatedAt = data.updatedAt;
};

Orders.createOrderWithDetails = async (requestData) => {
  const { order, orderDetails } = requestData;
  try {
    // Create the order
    const createdOrder = await Orders.create(order);

    // Create order details associated with the order
    const createdOrderDetails = await Promise.all(
      orderDetails.map(async (detail) => {
        // Associate order detail with the created order
        detail.order_id = createdOrder;
        // Create the order detail and store the result (including its id)
        const createdDetail = await Order_Detail.createOrderDetail(detail);

        return createdDetail;
      })
    );

    // Return the created order and order details
    return { order: createdOrder, orderDetails: createdOrderDetails };
  } catch (error) {
    throw `${error}`;
  }
};
Orders.create = (requestData) => {
  return new Promise((resolve, reject) => {
    //insert the order data into the "orders" table
    sql.query(
      "INSERT INTO orders (createdDate, count, status, total, note, customer_id, createdAt,updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        requestData.createdDate,
        requestData.count,
        requestData.status,
        requestData.total,
        requestData.note,
        requestData.customer_id,
        new Date(),
        new Date(),
      ],
      (err, orderRes) => {
        if (err) {
          reject(`Error creating order: ${err}`);
        } else {
          resolve(orderRes.insertId);
        }
      }
    );
  });
};

Orders.findById = (id, result) => {
  sql.query(
    `
    SELECT od.*,
      CONCAT('[', GROUP_CONCAT('{"checkinDate":"', od_detail.checkinDate, '",
      "checkoutDate":"', od_detail.checkoutDate, '",
      "status":"', od_detail.status, '",
      "dateCount":"', od_detail.dateCount, '",
      "total":"', od_detail.total, '",
      "personCount":"', od_detail.personCount, '",
      "room_name":"', r.name, '"}' SEPARATOR ','), ']') AS od_detail,
      c.fullname,
      c.email,
      c.phonenumber,
      emp.fullname as emp_fullname,
      emp.email as emp_email
    FROM orders od
      LEFT JOIN order_detail od_detail ON od_detail.order_id = od.id 
      LEFT JOIN room r ON r.id = od_detail.room_id
      LEFT JOIN customer c ON c.id = od.customer_id
      LEFT JOIN employee emp ON emp.id = od.employee_id
    WHERE od.id = ${id}
      GROUP BY od.id
 `,
    (err, res) => {
      if (err) {
        result(err, null);
        return;
      }

      if (res.length) {
        const result_order = JSON.parse(res[0].od_detail);
        result(null, {
          data: res[0],
          order_detail: result_order,
        });
        return;
      }

      // not found orders with the id
      result({ kind: "not_found" }, null);
    }
  );
};

Orders.getAll = (result) => {
  let query = `
    SELECT od.* ,
      CONCAT('[', GROUP_CONCAT('{"fullname":"', cus.fullname, '", "email":"', cus.email, '"}' SEPARATOR ','), ']') AS customer
    FROM orders od
      LEFT JOIN customer cus ON od.customer_id = cus.id 
    GROUP BY od.id
  `;

  sql.query(query, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Orders.getOrderStatus = (status, result) => {
  sql.query("SELECT * FROM orders WHERE status=?", status, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Orders.updateStatusOrderById = (data, result) => {
  // First, check if the employee with the given employee_id exists
  sql.query(
    "SELECT id FROM employee WHERE id = ?",
    [data.employee_id],
    (err, employeeResult) => {
      if (err) {
        result(null, err);
        return;
      }

      if (employeeResult.length === 0) {
        // If no employee with the provided employee_id is found, return an error
        result({ message: "Employee not found" }, null);
        return;
      }

      // Employee exists, proceed with updating the order status
      sql.query(
        "UPDATE orders SET status = ?, employee_id = ?, updatedAt =? WHERE id = ?",
        [data.status, data.employee_id,new Date(), data.id],
        (err, res) => {
          if (err) {
            result(null, err);
            return;
          }

          if (res.affectedRows === 0) {
            // If no rows were updated, it means the order was not found or not authorized
            result({ message: "Unauthorized or Order not found" }, null);
            return;
          }

          // Order status updated successfully by the authorized employee
          result(null, res);
        }
      );
    }
  );
};

Orders.remove = (id, result) => {
  sql.query("DELETE FROM type_room WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Tutorial with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted tutorial with id: ", id);
    result(null, res);
  });
};

module.exports = Orders;
