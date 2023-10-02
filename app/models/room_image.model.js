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

// TypeRoom.findById = (id, result) => {
//   sql.query(`SELECT * FROM type_room WHERE id = ${id}`, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(err, null);
//       return;
//     }

//     if (res.length) {
//       console.log("found tutorial: ", res[0]);
//       result(null, res[0]);
//       return;
//     }

//     // not found Tutorial with the id
//     result({ kind: "not_found" }, null);
//   });
// };

// TypeRoom.getAll = (title, result) => {
//   let query = "SELECT * FROM type_room";

//   if (title) {
//     query += ` WHERE title LIKE '%${title}%'`;
//   }

//   sql.query(query, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log("type_room: ", res);
//     result(null, res);
//   });
// };

// TypeRoom.getAllPublished = result => {
//   sql.query("SELECT * FROM type_room WHERE published=true", (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log("type_room: ", res);
//     result(null, res);
//   });
// };

// TypeRoom.updateById = (id, tutorial, result) => {
//   sql.query(
//     "UPDATE type_room SET name = ? WHERE id = ?",
//     [TypeRoom.name, id],
//     (err, res) => {
//       if (err) {
//         console.log("error: ", err);
//         result(null, err);
//         return;
//       }

//       if (res.affectedRows == 0) {
//         // not found Tutorial with the id
//         result({ kind: "not_found" }, null);
//         return;
//       }

//       console.log("updated tutorial: ", { id: id, ...tutorial });
//       result(null, { id: id, ...tutorial });
//     }
//   );
// };

// TypeRoom.remove = (id, result) => {
//   sql.query("DELETE FROM type_room WHERE id = ?", id, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     if (res.affectedRows == 0) {
//       // not found Tutorial with the id
//       result({ kind: "not_found" }, null);
//       return;
//     }

//     console.log("deleted tutorial with id: ", id);
//     result(null, res);
//   });
// };

// TypeRoom.removeAll = result => {
//   sql.query("DELETE FROM type_room", (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log(`deleted ${res.affectedRows} type_room`);
//     result(null, res);
//   });
// };

module.exports = RoomImage;
