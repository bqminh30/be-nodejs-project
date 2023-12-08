module.exports = (app) => {
    const orders = require("../controllers/orders.controller.js");
  
    var router = require("express").Router();
    // create a new order
    router.post("/booking", orders.booking);

    // get all orders 
    router.get("/", orders.getOrders);

    // get a order by id
    router.get('/:id',orders.getOrderById)

    router.post('/widget-order', orders.totalWidgetData)

    router.post('/widget-order-header', orders.totalWidgetDataHeader)

    router.post('/widget-order-year', orders.totalWidgetDataYear)
    router.post('/widget-order-service', orders.totalWidgetDataService)
    router.post('/widget-order-review', orders.totalWidgetDataReview)
  

    // get orders status
    router.get('/status/:id',orders.getOrderStatusById)

    // get orders status
    router.get('/customers/:id',orders.getOrderCustomerById)
    
    //Update a new Room
    router.put("/status", orders.updateOrderStatus);

    router.post("/check-room-availiable", orders.checkRoomAvailability);
  
    app.use("/api/orders", router);
  };
  