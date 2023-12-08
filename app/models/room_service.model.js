const sql = require("../config/db.js");

// constructor
const RoomService = function (data) {
  this.quantity = data.quantity;
  this.active = data.active;
  this.room_id = data.room_id;
  this.service_id = data.service_id;
  this.order_id = data.order_id;
  this.customer_id = data.customer_id;
  this.createdAt = data.createdAt;
  this.updatedAt = data.updatedAt;
};

RoomService.create = (data, result) => {
  sql.query("INSERT INTO room_service SET ?", data, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }

    console.log("created room_service: ", { id: res.insertId, ...data });
    result(null, { id: res.insertId, ...data });
  });
};

RoomService.getDetail = (id, result) => {
  let query = `
  SELECT 
    room_service.*,
    room.name,
    service.name,
    service.price,
    customer.fullname,
    customer.email,
    room.name
FROM 
    room_service
INNER JOIN 
    room ON room_service.room_id = room.id
INNER JOIN 
    service ON room_service.service_id = service.id
INNER JOIN 
    customer ON room_service.customer_id = customer.id WHERE room_service.id = ${id};`;
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found tutorial: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Tutorial with the id
    result({ kind: "not_found" }, null);
  });
};

RoomService.update = (id, data, result) => {
  sql.query(
    "UPDATE room_service SET quantity=?, room_id=?, service_id=?, updatedAt =? WHERE id = ?",
    [data.quantity, data.room_id, data.service_id, new Date(), id],
    (err, res) => {
      if (err) {
        result({
          status: 400,
          message: "Lỗi update dữ liệu dịch vụ phòng",
        });

        return;
      }

      if (res.affectedRows == 0) {
        // not found facilities with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated dịch vụ phòng: ", { id: id, ...data });
      result({ id: id, ...data });
    }
  );
};

RoomService.deleteServiceByRoomId = (room_id, callback) => {
  const query = "DELETE FROM room_service WHERE room_id = ?";
  sql.query(query, [room_id], (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
};

RoomService.getAll = (result) => {
  const query = `
SELECT 
    room_service.*,
    room.name,
    service.name,
    service.price,
    customer.fullname,
    customer.email,
    room.name
FROM 
    room_service
INNER JOIN 
    room ON room_service.room_id = room.id
INNER JOIN 
    service ON room_service.service_id = service.id
INNER JOIN 
    customer ON room_service.customer_id = customer.id;
`;

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("service: ", res);
    result(null, res);
  });
};

RoomService.updateStatusOrderById = (data, result) => {
      // Fetch the room_service information
      sql.query(
        "SELECT id, order_id, service_id, active FROM room_service WHERE id = ?",
        [data.id],
        (err, roomServiceResult) => {
          if (err) {
            result(null, err);
            return;
          }

          if (roomServiceResult.length === 0) {
            result({ message: "Room service not found" }, null);
            return;
          }

          const roomService = roomServiceResult[0];

          // Fetch the price from the service table
          sql.query(
            "SELECT price FROM service WHERE id = ?",
            [roomService.service_id],
            (err, serviceResult) => {
              if (err) {
                result(null, err);
                return;
              }

              if (serviceResult.length === 0) {
                result({ message: "Service not found" }, null);
                return;
              }

              const price = serviceResult[0].price;

              // Update room_service active status
              sql.query(
                "UPDATE room_service SET active = ?, updatedAt = ? WHERE id = ?",
                [data.active, new Date(), data.id],
                (err, res) => {
                  if (err) {
                    result(null, err);
                    return;
                  }

                  if (res.affectedRows === 0) {
                    result({ message: "Room service update failed" }, null);
                    return;
                  }

                  // Check if the status is changed to 1
                  if (data.active === 1 && roomService.active !== 1) {
                    // Update service_charge by adding the service price
                    sql.query(
                      "UPDATE orders SET service_charge = service_charge + ?, total = total + ? WHERE id = ?",
                      [price,price, roomService.order_id],
                      (err, res) => {
                        if (err) {
                          result(null, err);
                          return;
                        }

                        result(null, res);
                      }
                    );
                  } else if (data.active !== 1 && roomService.active === 1) {
                    // Update service_charge by subtracting the service price
                    sql.query(
                      "UPDATE orders SET service_charge = service_charge - ?, total - ? WHERE id = ?",
                      [price, price,roomService.order_id],
                      (err, res) => {
                        if (err) {
                          result(null, err);
                          return;
                        }

                        result(null, res);
                      }
                    );
                  } else {
                    result({ message: "No update required" }, null);
                  }
                }
              );
            }
          );
        }
      );
    }


module.exports = RoomService;
