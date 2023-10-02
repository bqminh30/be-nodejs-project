module.exports = app => {
  const customer = require("../controllers/customer.controller.js");

  var router = require("express").Router();

  // Create a new customer
  router.post("/register", customer.register);
  router.post("/login", customer.login);
  router.put("/update/:id", customer.update);

  router.post("/logout", customer.logout);


  app.use('/api/customer', router);
};
