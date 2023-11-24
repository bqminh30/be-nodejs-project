module.exports = app => {
  const customer = require("../controllers/customer.controller.js");
  const isAuthenticated = require('../middleware/authMiddleware');

  var router = require("express").Router();

  // Create a new customer
  router.post("/register", customer.register);

  router.post("/login", customer.login);
  
  router.put("/update/:id", customer.updateCustomer);

  router.post("/logout", customer.logout);

  router.get('/check-auth', customer.isAuth)
  
  router.post('/change-password',isAuthenticated, customer.changePassword)


  app.use('/api/customer', router);
};
