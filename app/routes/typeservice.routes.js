module.exports = app => {
    const typeservices = require("../controllers/typeservice.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Typeservices
    router.post("/", typeservices.create);
  
    // Retrieve all Typeservices
    router.get("/", typeservices.findAll);
  
    // Retrieve all published Typeservices
    router.get("/published", typeservices.findAllPublished);
  
    // Retrieve a single Typeservices with id
    router.get("/:id", typeservices.findOne);
  
    // Update a Typeservices with id
    router.put("/:id", typeservices.update);
  
    // Delete a Typeservices with id
    router.delete("/:id", typeservices.delete);
  
    // Delete all Typeservices
    router.delete("/", typeservices.deleteAll);
  
    app.use('/api/typeservices', router);
  };
  