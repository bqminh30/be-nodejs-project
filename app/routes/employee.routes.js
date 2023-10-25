module.exports = app => {
    const employees = require("../controllers/employee.controller.js");
  
    var router = require("express").Router();
  
    // Create a new employees
    router.post("/register", employees.register);
    
    router.post("/login", employees.login);

    router.get('/check-auth', employees.isAuth)

    router.put("/update/:id", employees.update);
  

    app.use('/api/employee', router);
  };
  