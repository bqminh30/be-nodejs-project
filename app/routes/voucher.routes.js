module.exports = app => {
    const vouchers = require("../controllers/voucher.controller.js");
  
    var router = require("express").Router();
  
    // Retrieve all vouchers
    router.get("/", vouchers.voucherAll);

    // Create a new voucher
    router.post("/", vouchers.voucherCreate);

    // Update a voucher
    router.put("/:id", vouchers.voucherUpdate);

    
  
    app.use('/api/voucher', router);
  };
  