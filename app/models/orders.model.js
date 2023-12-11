const sql = require("../config/db.js");
const Order_Detail = require("./order_detail.model");

// constructor
const Orders = function (data) {
  this.createdDate = data.createdDate;
  this.count = data.count;
  this.status = data.status;
  this.total = data.total;
  this.note = data.note;
  this.fullname = data.fullname;
  this.email = data.email;
  this.code = data.code;
  this.phone = data.phone;
  this.service_charge = data.service_charge;
  this.customer_id = data.customer_id;
  this.employee_id = data.employee_id;
  this.type_payment = data.type_payment;
  this.createdAt = data.createdAt;
  this.updatedAt = data.updatedAt;
};

Orders.createOrderWithDetails = async (requestData) => {
  const { order, orderDetails } = requestData;
  // console.log('orders created', order, orderDetails)
  try {
    // Create the order
    const createdOrderId = await Orders.create(order);

    // console.log('orders created', createdOrder)

    // Create order details associated with the order
    const createdOrderDetails = await Promise.all(
      orderDetails.map(async (detail) => {
        // Associate order detail with the created order
        detail.order_id = createdOrderId;

        // Create the order detail and store the result (including its id)
        const createdDetail = await Order_Detail.createOrderDetail(detail);

        return createdDetail;
      })
    );

    console.log("orders created", createdOrderDetails);

    // Return the created order and order details
    return { order: createdOrderId, orderDetails: createdOrderDetails };
  } catch (error) {
    throw `${error}`;
  }
};

Orders.create = (requestData) => {
  return new Promise((resolve, reject) => {
    //insert the order data into the "orders" table
    sql.query(
      "INSERT INTO orders (createdDate, count, status, total,phone, fullname, email,code, note,service_charge, type_payment,customer_id, createdAt,updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)",
      [
        new Date(),
        requestData.count,
        requestData.status == "Pending" ? 1 : 0,
        requestData.total,
        requestData.profile.phone,
        requestData.profile.fullname,
        requestData.profile.email,
        requestData.profile.code,
        requestData.note,
        0,
        "paypal",
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
      "price":"', od_detail.price, '",
      "personCount":"', od_detail.personCount, '",
      "childrenCount":"', od_detail.childrenCount, '",
      "room_id":"', od_detail.room_id, '",
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

Orders.getOrderCustomer = (id, result) => {
  sql.query(
    "SELECT * FROM orders WHERE customer_id = ? ORDER BY createdDate DESC",
    id,
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      result(null, res);
    }
  );
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
        [data.status, data.employee_id, new Date(), data.order_id],
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

Orders.widgetData = (id, result) => {
  let query = `
      SELECT
      (
          SELECT SUM(count)
          FROM orders
          WHERE DATE_FORMAT(createdDate, '%Y-%m') = DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m')
      ) AS percent,
      (
          SELECT SUM(count)
          FROM orders
          WHERE createdDate <= CURRENT_DATE - INTERVAL 1 MONTH
      ) AS total,
      JSON_ARRAYAGG(SUM_count) AS chart,
      JSON_ARRAYAGG(month) AS chart_month
    FROM (
      SELECT
          DATE_FORMAT(createdDate, '%b') AS month,
          SUM(count) AS SUM_count
      FROM orders
      WHERE createdDate >= DATE_SUB(LAST_DAY(CURRENT_DATE), INTERVAL 12 MONTH) 
            AND createdDate <= LAST_DAY(CURRENT_DATE)
      GROUP BY DATE_FORMAT(createdDate, '%b')
    ) subquery;
  `;
  sql.query(query, (err, res) => {
    if (err) {
      console.log("err", err);
      result(null, err);
    }
    result(null, res[0]);
  });
};

Orders.widgetDataHeader = (id, result) => {
  let query = `
  SELECT 
  JSON_OBJECT(
    'total_orders_this_week', 
        (SELECT Count(*) 
        FROM room),
    'total_users', 
        (SELECT COUNT(*) 
        FROM employee), -- Chỗ này có thể cần điều chỉnh tùy vào cấu trúc của bảng customer
    'total_orders', 
        (SELECT COUNT(*) 
        FROM orders),
    'total_orders_status_4', 
        (SELECT COUNT(*) 
        FROM orders 
        WHERE status = 3)
  ) AS order_stats;

  `;
  sql.query(query, (err, res) => {
    if (err) {
      console.log("err", err);
      result(null, err);
    }
    result(null, res);
  });
};

Orders.widgetDataReview = (id, result) => {
  let query = `
  SELECT JSON_ARRAYAGG(JSON_OBJECT('label', label, 'value', IF(value = 0, 0.1, value))) AS result
FROM (
    SELECT '1->2' AS label, IFNULL(COUNT(*), 0) AS value
    FROM reviews
    WHERE rating >= 1 AND rating < 2
    UNION ALL
    SELECT '2->3' AS label, IFNULL(COUNT(*), 0) AS value
    FROM reviews
    WHERE rating >= 2 AND rating < 3
    UNION ALL
    SELECT '3->4' AS label, IFNULL(COUNT(*), 0) AS value
    FROM reviews
    WHERE rating >= 3 AND rating < 4
    UNION ALL
    SELECT '4->5' AS label, IFNULL(COUNT(*), 0) AS value
    FROM reviews
    WHERE rating >= 4 AND rating <= 5
) AS merged_data;


  `;
  sql.query(query, (err, res) => {
    if (err) {
      console.log("err", err);
      result(null, err);
    }
    result(null, res[0]);
  });
};

Orders.widgetDataSerive = (id, result) => {
  let query = `
  SELECT 
  JSON_OBJECT(
    'Single Bed', SUM(CASE WHEN service_id = 7 THEN 1 ELSE 0 END),
    'Double Bed', SUM(CASE WHEN service_id = 8 THEN 1 ELSE 0 END),
    "Children's Beds", SUM(CASE WHEN service_id = 9 THEN 1 ELSE 0 END)
  ) AS series
FROM room_service
WHERE service_id IN (7, 8, 9);


  `;
  sql.query(query, (err, res) => {
    if (err) {
      console.log("err", err);
      result(null, err);
    }
    result(null, res[0]);
  });
};

Orders.widgetDataYear = (id, result) => {
  let query = `
  SELECT 
    JSON_OBJECT(
        'categories', JSON_ARRAY(
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ),
        'series', JSON_ARRAY(
            JSON_OBJECT(
                'year', '2022',
                'name', 'Total',
                'data', JSON_ARRAY(
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 1 AND YEAR(createdDate) = 2022),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 2 AND YEAR(createdDate) = 2022),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 3 AND YEAR(createdDate) = 2022),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 4 AND YEAR(createdDate) = 2022),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 5 AND YEAR(createdDate) = 2022),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 6 AND YEAR(createdDate) = 2022),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 7 AND YEAR(createdDate) = 2022),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 8 AND YEAR(createdDate) = 2022),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 9 AND YEAR(createdDate) = 2022),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 10 AND YEAR(createdDate) = 2022),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 11 AND YEAR(createdDate) = 2022),
                    -- Thêm các tháng còn lại của năm 2022
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 12 AND YEAR(createdDate) = 2022)
                )
            ),
            JSON_OBJECT(
                'year', '2023',
                'name', 'Total',
                'data', JSON_ARRAY(
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 1 AND YEAR(createdDate) = 2023),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 2 AND YEAR(createdDate) = 2023),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 3 AND YEAR(createdDate) = 2023),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 4 AND YEAR(createdDate) = 2023),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 5 AND YEAR(createdDate) = 2023),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 6 AND YEAR(createdDate) = 2023),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 7 AND YEAR(createdDate) = 2023),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 8 AND YEAR(createdDate) = 2023),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 9 AND YEAR(createdDate) = 2023),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 10 AND YEAR(createdDate) = 2023),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 11 AND YEAR(createdDate) = 2023),
                    -- Thêm các tháng còn lại của năm 2023
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 12 AND YEAR(createdDate) = 2023)
                )
            ),
            JSON_OBJECT(
                'year', '2024',
                'name', 'Total',
                'data', JSON_ARRAY(
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 1 AND YEAR(createdDate) = 2024),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 2 AND YEAR(createdDate) = 2024),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 3 AND YEAR(createdDate) = 2024),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 4 AND YEAR(createdDate) = 2024),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 5 AND YEAR(createdDate) = 2024),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 6 AND YEAR(createdDate) = 2024),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 7 AND YEAR(createdDate) = 2024),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 8 AND YEAR(createdDate) = 2024),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 9 AND YEAR(createdDate) = 2024),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 10 AND YEAR(createdDate) = 2024),
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 11 AND YEAR(createdDate) = 2024),
                    -- Thêm các tháng còn lại của năm 2024
                    (SELECT COUNT(*) FROM orders WHERE MONTH(createdDate) = 12 AND YEAR(createdDate) = 2024)
                )
            )
        )
    ) AS chart
FROM dual;

  `;
  sql.query(query, (err, res) => {
    if (err) {
      console.log("err", err);
      result(null, err);
    }
    result(null, res);
  });
};

Orders.widgetDataTotal = (id, result) => {
  let query = `
  SELECT 
  YEAR(o.createdDate) AS year,
  MONTH(o.createdDate) AS month,
  SUM(o.total) AS total,
  SUM(o.service_charge) AS service_charge
FROM orders o
LEFT JOIN room_service rs ON o.id = rs.order_id -- Thay order_id bằng khóa ngoại thích hợp
WHERE YEAR(o.createdDate) IN (2022, 2023) -- Chọn các năm 2022 và 2023
  AND (o.status = 1 OR rs.active = 1) -- Chỉ khi status của orders = 1 hoặc active của room_service = 1
GROUP BY YEAR(o.createdDate), MONTH(o.createdDate)
ORDER BY YEAR(o.createdDate), MONTH(o.createdDate);


`;
  sql.query(query, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }

    result(null, res);
  });
};

Orders.remove = (id, result) => {
  sql.query("DELETE FROM orders WHERE id = ?", id, (err, res) => {
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
