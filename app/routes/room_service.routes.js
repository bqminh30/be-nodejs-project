module.exports = (app) => {
    const room_service = require("../controllers/room_service.controller.js");
  
    var router = require("express").Router();
    // // Get All Room
    router.get("/", room_service.findAll);
    // //Get a Room
    router.get('/:id',room_service.findDetail)

     //Update a new Room
     router.put("/status", room_service.updateServiceStatus);
    // //Get Rooms by type Room id
    // router.get('/type/:id',room.findRoomsByTypeRoomId)
    // // Create a new Room
    // router.get("/create", room.createFormRoom);
    router.post("/create", room_service.roomserviceCreate);
    
    router.post("/create-mul/:id", room_service.roomServiceMulCreate)
  
    //Update a new Room
    router.post("/update/:id", room_service.roomServiceUpdate);
  
    app.use("/api/room_service", router);
  };
  