module.exports = (app) => {
    const room_service = require("../controllers/room_service.controller.js");
  
    var router = require("express").Router();
    // // Get All Room
    // router.get("/", room.findAll);
    // //Get a Room
    // router.get('/:id',room.findRoomById)
    // //Get Rooms by type Room id
    // router.get('/type/:id',room.findRoomsByTypeRoomId)
    // // Create a new Room
    // router.get("/create", room.createFormRoom);
    router.post("/create", room_service.roomserviceCreate);
    router.post("/create-mul/:id", room_service.roomServiceMulCreate)
  
    //Update a new Room
    // router.put("/update/:id", room.updateRoom);
  
    app.use("/api/room_service", router);
  };
  