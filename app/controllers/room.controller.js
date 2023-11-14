const Room = require("../models/room.model.js");
var imageMiddleware = require("../middleware/image-middleware");
var multer = require("multer");
var cloudinary = require("cloudinary").v2;
const db = require("../config/db.js");

// Create and Save a new Room
exports.createFormRoom = (req, res) => {
  res.render("upload-form");
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

  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      res.send(err);
    } else if (err) {
      res.send(err);
    } else {
      if (
        req.body.name == "" ||
        req.body.title == "" ||
        req.body.description == "" ||
        req.body.price == 0
      ) {
        res.status(400).send({
          message: "Thiếu dữ liệu.",
        });

        return;
      }

      let imageName = req.body.image;
      const imagePath = JSON.parse(imageName);

      let dataImage = "";
      await cloudinary.uploader
        .upload(
          imagePath
            ? `G:/ProjectHou/images/p1/${imagePath.path}`
            : req.body.image
        )
        .then((result) => (dataImage = result.url))
        .catch((err) => console.log("err", err));

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
        image: dataImage,
        numberChildren: req.body.numberChildren ? req.body.numberChildren : 0,
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
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        res.send(err);
      } else if (err) {
        res.send(err);
      } else {
        let dataImage = "";
        let imageName = req.body.image;
        const containsCloudinary = imageName.indexOf("res.cloudinary.com") !== -1;
        if(containsCloudinary){
          dataImage = imageName
        }else {
          const imagePath = JSON.parse(imageName);
          await cloudinary.uploader
          .upload(
            imagePath.path
              ? `G:/ProjectHou/images/p1/${imagePath.path}`
              : req.body.image
          )
          .then((result) => (dataImage = result.url))
          .catch((err) => console.log("err", err));
        }

        console.log('req.body.numberChildren', req.body.numberChildren, typeof req.body.numberChildren)

        const room = new Room({
          name: req.body.name,
          title: req.body.title,
          description: req.body.description,
          price: req.body.price,
          priceSale: req.body.priceSale,
          numberBed: req.body.numberBed,
          numberPeople: req.body.numberPeople,
          numberChildren: req.body.numberChildren,
          status: req.body.status,
          label: req.body.label,
          isLiked: req.body.isLiked,
          image: dataImage,
          type_room_id: req.body.type_room_id,
          updatedAt: new Date(),
        });

        Room.updateRoomById(req.params.id, room, (data, err) => {
          if (err) {
            res.status(500).send({
              message: "Error updating room with id " + err,
            });
          } else

          Room.updateVoucherCronJob((data,err) => {
            if (err) {
              res.status(500).send({
                message: "Error updating room with id " + err,
              });
            }else {
              res.status(200).send({
                data: data,
                message: "Cập nhật phòng thành công",
              });
            }
          })
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

exports.findLimit = (req, res) => {
  const id = req.params.id;

  Room.getLimit(id, (err, data) => {
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



exports.searchRoom = (req, res) => {
  const {
    name,
    startDate,
    endDate,
    numberBed,
    numberPeople,
    numberChildren,
  } = req.body;

  const conditions = [];
  const values = [];

  if (name) {
    conditions.push('name LIKE ?'); // Điều kiện tìm kiếm chuỗi với LIKE
    values.push(`%${name}%`); // Đặt '%' trước và sau giá trị bạn muốn tìm kiếm
  }
  
  

  if (startDate && endDate) {
    conditions.push(`
      id NOT IN (
        SELECT room_id
        FROM order_detail
        WHERE (
          ? >= checkinDate
          AND ? <= checkoutDate
        ) OR (
          ? >= checkinDate
          AND ? <= checkoutDate
        ) OR (
          ? >= checkinDate
          AND ? <= checkoutDate
        )
      )
    `);
    values.push(startDate, endDate, startDate, startDate, endDate, endDate);
  }

  if (numberBed) {
    conditions.push('numberBed >= ?');
    values.push(numberBed);
  }

  if (numberPeople) {
    conditions.push('numberPeople >= ?');
    values.push(numberPeople);
  }

  if (numberChildren) {
    conditions.push('numberChildren >= ?');
    values.push(numberChildren);
  }

  const queryString = `
    SELECT *
    FROM room
    WHERE ${conditions.join(' AND ')}
  `;

  db.query(queryString, values, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    } else {
      console.log('results.data', results)
      res.status(200).json({ data: results });
    }
  });
}