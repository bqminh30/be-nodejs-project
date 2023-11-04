module.exports = app => {
    const employees = require("../controllers/employee.controller.js");
    const isAuthenticated = require('../middleware/authMiddleware');
  
    var router = require("express").Router();
  
    // Create a new employees
    router.post("/register", employees.register);
    
    router.post("/login", employees.login);

    router.get('/check-auth', employees.isAuth)

    router.put("/update/:id", employees.update);

    router.put('/update-quick/:id', employees.updateQuick)

    router.get('/list', employees.listEmployee)
  

    app.use('/api/employee', router);
  };
  