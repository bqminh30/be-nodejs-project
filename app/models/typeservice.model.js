const sql = require("../config/db.js");

// constructor
const TypeService = function(type_service) {
  this.name = type_service.name;
};

TypeService.create = (newTypeService, result) => {
  sql.query("INSERT INTO type_service SET ?", newTypeService, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created type service: ", { id: res.insertId, ...newTypeService });
    result(null, { id: res.insertId, ...newTypeService });
  });
};

TypeService.findById = (id, result) => {
  sql.query(`SELECT * FROM type_service WHERE id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found type service: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found type service with the id
    result({ kind: "not_found" }, null);
  });
};

TypeService.getAll = (title, result) => {
  let query = "SELECT * FROM type_service";

  if (title) {
    query += ` WHERE name LIKE '%${title}%'`;
  }

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("type_service: ", res);
    result(null, res);
  });
};

TypeService.getAllPublished = result => {
  sql.query("SELECT * FROM type_service WHERE published=true", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("type_service: ", res);
    result(null, res);
  });
};

TypeService.updateById = (id, type_service, result) => {
  sql.query(
    "UPDATE type_service SET name = ? WHERE id = ?",
    [TypeService.name, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found type service with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated type service: ", { id: id, ...type_service });
      result(null, { id: id, ...type_service });
    }
  );
};

TypeService.remove = (id, result) => {
  sql.query("DELETE FROM type_service WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found type service with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted type service with id: ", id);
    result(null, res);
  });
};

TypeService.removeAll = result => {
  sql.query("DELETE FROM type_service", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} type_service`);
    result(null, res);
  });
};

module.exports = TypeService;
