module.exports = (app) => {
    const orders = require("../controllers/orders.controller.js");
  
    var router = require("express").Router();
    // Get All Room
    // router.get("/", room.findAll);
    // //Get a Room
    // router.get('/:id',room.findRoomById)
    // //Get Rooms by type Room id
    // router.get('/type/:id',room.findRoomsByTypeRoomId)
    // // Create a new Room
    // router.get("/create", room.createFormRoom);
    router.post("/booking", orders.booking);

    // get all orders 
    router.get("/", orders.getOrders);

    // get a order by id
    router.get('/:id',orders.getOrderById)
  
    // get orders status
    router.get('/status/:id',orders.getOrderById)
    //Update a new Room
    router.put("/status", orders.updateOrderStatus);
  
    app.use("/api/orders", router);
  };
  