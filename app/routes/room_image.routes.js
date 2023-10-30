
module.exports = (app) => {
  const roomImage = require("../controllers/room_image.controller.js");

  var router = require("express").Router();
  // Get All Room
  router.get("/create", roomImage.roomImageUpload);
  router.post("/create", roomImage.roomImageCreate);

  router.put("/update", roomImage.roomImageUpdate);

  app.use("/api/room-image", router);
};
