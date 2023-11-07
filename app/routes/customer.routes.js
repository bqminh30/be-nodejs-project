module.exports = app => {
  const customer = require("../controllers/customer.controller.js");

  var router = require("express").Router();

  // Create a new customer
  router.post("/register", customer.register);
  router.post("/login", customer.login);
  router.put("/update/:id", customer.update);

  router.post("/logout", customer.logout);

  router.get('/check-auth', customer.isAuth)


  app.use('/api/customer', router);
};
