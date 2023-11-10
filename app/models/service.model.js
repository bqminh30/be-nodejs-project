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

    console.log("created service: ", { id: res.insertId, ...newService });
    result(null, { id: res.insertId, ...newService });
  });
};

Service.getById = (id, result) => {
  let query = `
  SELECT s.id, s.name, s.unit, s.price,s.type_service_id,s.status, type_service.name AS type_service
   from service AS s LEFT JOIN type_service ON type_service.id = s.type_service_id WHERE s.id = ${id}`;

   sql.query(query, (err, res) => {
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
}


Service.findById = (id, result) => {
  sql.query(`SELECT s.id, s.name, s.unit, s.price,s.type_service_id,s.service, type_service.name AS type_service from service AS s LEFT JOIN type_service ON type_service.id = s.type_service_id WHERE id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      // console.log("found service: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Service with the id
    result({ kind: "not_found" }, null);
  });
};

Service.getAll = (title, result) => {
  let query = "SELECT s.id, s.name,s.status, s.unit, s.price,s.type_service_id, type_service.name AS type_service from service AS s LEFT JOIN type_service ON type_service.id = s.type_service_id";

  if (title) {
    query += ` WHERE name LIKE '%${title}%'`;
  }

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

Service.updateById = (id, data, result) => {
  sql.query(
    "UPDATE service SET name = ?, unit = ?, price =?, service=? WHERE id = ?",
    [data.name,data.unit, data.price,data.service, id],
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

      console.log("updated service: ", { id: id, ...data });
      result(null, { id: id, ...data });
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

module.exports = Service;
