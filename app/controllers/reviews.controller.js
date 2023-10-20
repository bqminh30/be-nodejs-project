const Reviews = require("../models/reviews.model.js");
var imageMiddleware = require("../middleware/image-middleware");
var multer = require("multer");

exports.checkReviewEmployee = (req, res) => {
  const customer_id = req.query.customer_id;
  const room_id = req.query.room_id;

  const data = {
    customer_id,
    room_id,
  };

  Reviews.checkReview(data, (err, data) => {
    console.log("err", err, data);
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Reviews.",
      });
    else res.send(data);
  });
};
// Create and Save a new Reviews
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Phải có trường dữ liệu",
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
      var imageName = req.file.originalname;
      const review = new Reviews({
        content: req.body.content,
        rating: req.body.rating,
        image: imageName,
        status: 1,
        room_id: req.body.room_id,
        customer_id: req.body.customer_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Save Reviews in the database
      Reviews.createReview(review, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating Review.",
          });
        else
          res.status(200).send({
            data: data,
            message: "Đánh giá phòng thành công",
          });
      });
    }
  });
};

// Retrieve all Reviews from the database (with condition).
exports.getReviewsById = (req, res) => {
  const room_id = req.params.id;
  Reviews.getAll(room_id, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Reviews.",
      });
    else res.status(200).send(data);
  });
};

// Update a Service identified by the id in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

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
      var imageName = req.file.originalname;
      const data = {
        content: req.body.content,
        rating: req.body.rating,
        image: imageName ? imageName : req.body.image,
      };

      Reviews.updateById(req.params.id, data, (err, data) => {
        if (err) {
          res.status(404).send({
            message: `Not found Reviews with id ${req.params.id}.`,
          });
        } else res.status(200).send(data);
      });
    }
  });
};

// Delete a TypeRoom with the specified id in the request
exports.delete = (req, res) => {
  Reviews.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Service with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete Service with id " + req.params.id,
        });
      }
    } else
      res.status(200).send({ message: `Service was deleted successfully!` });
  });
};
