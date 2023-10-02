module.exports = app => {
    const vouchers = require("../controllers/voucher.controller.js");
  
    var router = require("express").Router();
  
    // Create a new voucher
    router.post("/", vouchers.voucherCreate);

    // Update a voucher
    router.put("/:id", vouchers.voucherUpdate);
    // // Retrieve all Tutorials
    // router.get("/", tutorials.findAll);
  
    // // Retrieve all published Tutorials
    // router.get("/published", tutorials.findAllPublished);
  
    // // Retrieve a single Tutorial with id
    // router.get("/:id", tutorials.findOne);
  
    // // Update a Tutorial with id
    // router.put("/:id", tutorials.update);
  
    // // Delete a Tutorial with id
    // router.delete("/:id", tutorials.delete);
  
  
    app.use('/api/voucher', router);
  };
  