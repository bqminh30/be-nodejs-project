const sql = require("../config/db.js");

// constructor
const Facilities = function (value) {
  this.name = value.name;
  this.image = value.image;
  this.location = value.location;
  this.phone = value.phone;
  this.logo = value.logo;
  this.title = value.title;
  this.createdAt = new Date();
};

Facilities.create = (newFacilities, result) => {
  sql.query("INSERT INTO facilities SET ?", newFacilities, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created facilities: ", { id: res.id, ...newFacilities });
    result(null, { id: res.insertId, ...newFacilities });
  });
};

Facilities.updateFacility = (id, facilities, result) => {
  sql.query(
    "UPDATE facilities SET name=?, location=?, phone=?, logo=?, title=?, image=?, updatedAt =? WHERE id = ?",
    [
      facilities.name,
      facilities.location,
      facilities.phone,
      facilities.logo,
      facilities.title,
      facilities.image,
      facilities.updatedAt,
      id,
    ],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);

        return;
      }

      if (res.affectedRows == 0) {
        // not found facilities with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated facilities: ", { id: id, ...facilities });
      result({ id: id, ...facilities });
    }
  );
};

module.exports = Facilities;
