const Service = require("../models/service.model.js");

// Create and Save a new TypeRoom
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a TypeRoom
  const service = new Service({
    name: req.body.name,
    unit: req.body.unit,
    price: req.body.price,
    type_service_id: req.body.type_service_id,
  });

  // Save TypeRoom in the database
  Service.create(service, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the service."
      });
    else res.status(200).send(data);
  });
};

// Retrieve all TypeRooms from the database (with condition).
exports.findAll = (req, res) => {
  const name = req.query.name;

  Service.getAll(name, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving TypeRooms."
      });
    else res.status(200).send(data);
  });
};

// Retrieve all TypeRooms from the database (with condition).
exports.findById = (req, res) => {
  const id = req.params.id;

  Service.getById(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving TypeRooms."
      });
    else res.status(200).send(data);
  });
};

// Find a single TypeRoom by Id
exports.findByTypeService = (req, res) => {
  Service.getAllServiceByTypeService(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found TypeRoom with id ${req.params.id}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving TypeRoom with id " + req.params.id
        });
      }
    } else res.status(200).send(data);
  });
};


// Update a Service identified by the id in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Service.updateById(
    req.params.id,
    new Service(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Service with id ${req.params.id}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Service with id " + req.params.id
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a TypeRoom with the specified id in the request
exports.delete = (req, res) => {
  Service.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Service with id ${req.params.id}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Service with id " + req.params.id
        });
      }
    } else res.send({ message: `Service was deleted successfully!` });
  });
};

