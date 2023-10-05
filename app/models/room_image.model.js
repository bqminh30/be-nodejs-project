const sql = require("../config/db.js");

// constructor
const RoomImage = function(data) {
  this.name = data.name;
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


module.exports = RoomImage;
