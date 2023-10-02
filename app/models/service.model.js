const sql = require("../config/db.js");

// constructor
const Service = function(service) {
  this.name = service.name;
  this.unit = service.unit;
  this.price = service.price;
  this.type_service_id = service.type_service_id;
};

Service.create = (newService, result) => {
  sql.query("INSERT INTO service SET ?", newService, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created tutorial: ", { id: res.insertId, ...newService });
    result(null, { id: res.insertId, ...newService });
  });
};

Service.findById = (id, result) => {
  sql.query(`SELECT * FROM service WHERE id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found service: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Service with the id
    result({ kind: "not_found" }, null);
  });
};

Service.getAll = (title, result) => {
  let query = "SELECT * FROM service";

  if (title) {
    query += ` WHERE name LIKE '%${title}%'`;
  }

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("service: ", res);
    result(null, res);
  });
};

Service.getAllServiceByTypeService = (id, result) => {
  sql.query(`SELECT * FROM service WHERE type_service_id='${id}'`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("service: ", res);
    result(null, res);
  });
};

Service.updateById = (id, service, result) => {
  sql.query(
    "UPDATE service SET name = ?, unit = ?, price =? WHERE id = ?",
    [service.name,service.unit, service.price, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Service with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated service: ", { id: id, ...service });
      result(null, { id: id, ...service });
    }
  );
};

Service.remove = (id, result) => {
  sql.query("DELETE FROM service WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Service with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted service with id: ", id);
    result(null, res);
  });
};

// Service.removeAll = result => {
//   sql.query("DELETE FROM service", (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log(`deleted ${res.affectedRows} service`);
//     result(null, res);
//   });
// };

module.exports = Service;
