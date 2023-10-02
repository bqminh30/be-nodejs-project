const sql = require("../config/db.js");

// constructor
const RoomService = function(data) {
  this.quantity = data.quantity;
  this.room_id = data.room_id;
  this.service_id = data.service_id;
  this.createdAt = new Date();
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
      [
        data.quantity,
        data.room_id,
        data.service_id,
        new Date(),
        id,
      ],
      (err, res) => {
        if (err) {
          result({
              status: 400,
              message: "Lỗi update dữ liệu dịch vụ phòng"
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


module.exports = RoomService;
