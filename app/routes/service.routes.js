module.exports = app => {
    const services = require("../controllers/service.controller.js");
  
    var router = require("express").Router();
  
    // Create a new service
    router.post("/", services.create);
  
    // Retrieve all services
    router.get("/", services.findAll);
  
    // Retrieve services with id type service
    router.get("/:id", services.findByTypeService);
  
    // Update a services with id
    router.put("/:id", services.update);
  
    // Delete a services with id
    router.delete("/:id", services.delete);
  
    // Delete all servicess
    // router.delete("/", services.deleteAll);
  
    app.use('/api/services', router);
  };
  