

module.exports = (app) => {
  const room = require("../controllers/room.controller.js");

  var router = require("express").Router();
  // Get All Room
  router.get("/", room.findAll);
  // Get Rooms Limit
  router.get('/limit/:id', room.findLimit)
  //Get a Room
  router.get('/:id',room.findRoomById)
  //Get Rooms by type Room id
  router.get('/type/:id',room.findRoomsByTypeRoomId)
  // Create a new Room
  // router.get("/create", room.createFormRoom);
  
  router.post("/create", room.createRoom);

  //Update a new Room
  router.put("/update/:id", room.updateRoom);

  app.use("/api/rooms", router);
};
