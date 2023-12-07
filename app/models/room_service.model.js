const sql = require("../config/db.js");

// constructor
const RoomService = function (data) {
  this.quantity = data.quantity;
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

module.exports = RoomService;
