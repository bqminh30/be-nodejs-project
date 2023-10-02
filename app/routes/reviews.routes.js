module.exports = app => {
    const reviews = require("../controllers/reviews.controller.js");
  
    var router = require("express").Router();
  
    // Create a new review
    router.post("/create", reviews.create);
  
    // Retrieve all reviews
    router.post("/check-auth", reviews.checkReviewEmployee);
  
    // Get Reviews by Room
    router.get("/:id", reviews.getReviewsById);
  
    // Update a review with id
    router.put("/:id", reviews.update);
  
    // Delete a review with id
    router.delete("/:id", reviews.delete);
  

    app.use('/api/reviews', router);
  };
  