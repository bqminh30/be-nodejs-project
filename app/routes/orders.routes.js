module.exports = (app) => {
    const orders = require("../controllers/orders.controller.js");
  
    var router = require("express").Router();
    // create a new order
    router.post("/booking", orders.booking);

    // get all orders 
    router.get("/", orders.getOrders);

    // get a order by id
    router.get('/:id',orders.getOrderById)
  
    // get orders status
    router.get('/status/:id',orders.getOrderStatusById)
    
    //Update a new Room
    router.put("/status", orders.updateOrderStatus);
  
    app.use("/api/orders", router);
  };
  