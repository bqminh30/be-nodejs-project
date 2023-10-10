const sql = require("../config/db.js");

// constructor
const TypeRoom = function(type_room) {
  this.name = type_room.name;
};

TypeRoom.create = (newTutorial, result) => {
  sql.query("INSERT INTO type_room SET ?", newTutorial, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created tutorial: ", { id: res.insertId, ...newTutorial });
    result(null, { id: res.insertId, ...newTutorial });
  });
};

TypeRoom.findById = (id, result) => {
  sql.query(`SELECT * FROM type_room WHERE id = ${id}`, (err, res) => {
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

TypeRoom.getAll = (title, result) => {
  let query = "SELECT * FROM type_room";

  if (title) {
    query += ` WHERE title LIKE '%${title}%'`;
  }

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // console.log("type_room: ", res);
    result(null, res);
  });
};

TypeRoom.getAllPublished = result => {
  sql.query("SELECT * FROM type_room WHERE published=true", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("type_room: ", res);
    result(null, res);
  });
};

TypeRoom.updateById = (typeroom, result) => {
  sql.query(
    "UPDATE type_room SET name = ? WHERE id = ?",
    [typeroom.name, typeroom.id],
    (err, res) => {
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

      console.log("updated typeroom: ", { id: typeroom.id, ...typeroom });
      result(null, { id: typeroom.id, ...typeroom });
    }
  );
};

TypeRoom.remove = (id, result) => {
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

TypeRoom.removeAll = result => {
  sql.query("DELETE FROM type_room", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} type_room`);
    result(null, res);
  });
};

module.exports = TypeRoom;
