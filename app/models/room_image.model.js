const sql = require("../config/db.js");

// constructor
const RoomImage = function(data) {
  this.name = data.name;
  this.type = data.type;
  this.data = data.data;
  this.room_id = data.room_id;
  this.createdAt = data.createdAt;
  this.updatedAt = data.updatedAt;
};

RoomImage.create = (data, result) => {
  sql.query("INSERT INTO room_image SET ?", data, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created room_image: ", { id: res.insertId, ...data });
    result(null, { id: res.insertId, ...data });
  });

};

RoomImage.findOneAndUpdate = (data, result) => {
  const query = "UPDATE room_image SET ? WHERE room_id = ?";

  sql.query(query, [data, data.room_id], (err, res) => {
    if (err) {
      console.error("Lỗi cập nhật dữ liệu: " + err);
      reject(err,null);
      return;
    }
    result(null, res);

    console.log('ere', err, res)
  });
}

RoomImage.deleteImagesByRoomId = (room_id, callback) => {
  const query = 'DELETE FROM room_image WHERE room_id = ?';
  sql.query(query, [room_id], (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
};





module.exports = RoomImage;
