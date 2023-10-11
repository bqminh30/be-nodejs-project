const Room = require("../models/room.model.js");
var imageMiddleware = require("../middleware/image-middleware");
var multer = require("multer");
// Create and Save a new Room
exports.createFormRoom = (req, res) => {
  res.render("upload-form-room");
};
exports.createRoom = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  // Create a TypeRoom
  var upload = multer({
    storage: imageMiddleware.image.storage(),
    allowedImage: imageMiddleware.image.allowedImage,
  }).single("image");

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.send(err);
    } else if (err) {
      res.send(err);
    } else {
      // store image in database
      let imageName = req.body.image
      const image = JSON.parse(imageName)

      // if (req.file && req.file.originalname) {
      //   imageName = req.file;
      // } else {
      //   imageName = req.body.image.preview;
      // }

      if(
        req.body.name == '' || req.body.title == '' || req.body.description == '' ||  req.body.price == 0
      ){
        res.status(400).send({
          message:
             "Thiếu dữ liệu.",
        });

        return;
      }
      console.log('imageName', req.file, req.body)

      const room = new Room({
        name: req.body.name,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price ? req.body.price: 0,
        priceSale: req.body.priceSale ? req.body.priceSale : 0,
        rating: 0,
        totalRating: 0,
        totalReview: 0,
        numberBed: req.body.numberBed ? req.body.numberBed : 0,
        numberPeople: req.body.numberPeople ? req.body.numberPeople : 0,
        status: req.body.status ? req.body.status : 0,
        label: req.body.label ? req.body.label: 0,
        isLiked: req.body.isLiked ? req.body.isLiked : 0,
        image: image.preview,
        voucher_id: req.body.voucher_id ? req.body.voucher_id : null,
        type_room_id: req.body.type_room_id ? req.body.type_room_id : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      //  Save TypeRoom in the database
      Room.createRoom(room, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Room.",
          });
        else
          res.status(200).send({
            data: data,
            message: "Tạo phòng thành công",
          });
      });
    }
  });
};

// Update a Room identified by the id in the request
exports.updateRoom = (req, res) => {
  try {
    var upload = multer({
      storage: imageMiddleware.image.storage(),
      allowedImage: imageMiddleware.image.allowedImage,
    }).single("image");
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        res.send(err);
      } else if (err) {
        res.send(err);
      } else {
        // store image in database
        var imageName = req.file.originalname;
        const room = new Room({
          name: req.body.name,
          title: req.body.title,
          description: req.body.description,
          price: req.body.price,
          // rating: req.body.rating ? req.body.rating : 0,
          // totalReview: req.body.totalReview ? req.body.totalReview : 0,
          // totalRating: req.body.totalRating ? req.body.totalRating : 0,
          numberBed: req.body.numberBed,
          numberPeople: req.body.numberPeople,
          status: req.body.status,
          label: req.body.label,
          isLiked: req.body.isLiked,
          image: imageName ? imageName : req.body.image,
          voucher_id: req.body.voucher_id ? req.body.voucher_id : null,
          type_room_id: req.body.type_room_id ? req.body.type_room_id : null,
          updatedAt: new Date(),
        });

        Room.updateRoomById(req.params.id, room, (data, err) => {
          if (err) {
            res.status(500).send({
              message: "Error updating room with id " + err,
            });
          } else
            Room.updatePriceSale(
              req.body.price,
              req.body.voucher_id,
              req.params.id,
              (data, err) => {
                if (err) {
                  res.status(400).send({
                    message: "Error updating room with id " + err,
                  });
                } else {
                  res.send({
                    status: 200,
                    message: "Update phòng thành công",
                  });
                }
              }
            );
        });
      }
    });
  } catch (err) {
    res.send({
      status: 404,
      message: "Request Update Failed",
    });
  }
};

// get all rooms in the databases
exports.findAll = (req, res) => {
  const name = req.query.name;

  Room.getAll(name, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Room.",
      });
    else res.status(200).send(data);
  });
};

// Find a single Room by Id
exports.findRoomById = (req, res) => {
  Room.findRoomById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Room with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Room with id " + req.params.id,
        });
      }
    } else res.status(200).send(data);
  });
};

// Find Room by Type Room Id
exports.findRoomsByTypeRoomId = (req, res) => {
  Room.getRoomsByRoomTypeId(req.params.id, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Room.",
      });
    else res.send(data);
  });
};

// find all published TypeRooms
exports.findAllPublished = (req, res) => {
  TypeRoom.getAllPublished((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving TypeRooms.",
      });
    else res.send(data);
  });
};

// Delete a TypeRoom with the specified id in the request
exports.delete = (req, res) => {
  TypeRoom.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found TypeRoom with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete TypeRoom with id " + req.params.id,
        });
      }
    } else res.send({ message: `TypeRoom was deleted successfully!` });
  });
};
