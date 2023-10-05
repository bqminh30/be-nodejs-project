const RoomImage = require("../models/room_image.model.js");
var imageMiddleware = require("../middleware/image-middleware");
var multer = require("multer");
const fs = require("fs");

module.exports = {
  roomImageUpload: function (req, res) {
    res.render("upload-form");
  },
  roomserviceCreate: function (req, res) {
    try {
      const multi_upload = multer({
        storage: imageMiddleware.image.storage(),
        allowedImage: imageMiddleware.image.allowedImage,
        limits: { fileSize: 1 * 1024 * 1024 }, // 1M
      }).array("data", 5);

      multi_upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          res
            .status(500)
            .send({
              error: { message: `Multer uploading error: ${err.message}` },
            })
            .end();
          return;
        } else if (err) {
          // An unknown error occurred when uploading.
          if (err.name == "ExtensionError") {
            res
              .status(413)
              .send({ error: { message: err.message } })
              .end();
          } else {
            res
              .status(500)
              .send({
                error: { message: `unknown uploading error: ${err.message}` },
              })
              .end();
          }
          return;
        }
        const room_id = req.body.room_id; 
        const promises = req.files.map((file) => {
          return new Promise((resolve, reject) => {
            const inputValues = {
              name: file.originalname,
              type: file.mimetype,
              data: file.size,
              room_id: room_id,
              createdAt: new Date(),
            };
        
            RoomImage.create(inputValues, function (err, data) {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            });
          });
        });
        
        Promise.all(promises)
          .then((results) => {
            res.status(200).send({
              message: "Tạo ảnh phòng thành công",
              status: 200,
              data: results,
            });
          })
          .catch((error) => {
            res.status(500).send({
              message: "Tạo ảnh phòng thất bại",
              status: 500,
              data: error,
            });
          });
      });
    } catch (error) {
      res.send({
        status: 500,
        message: `Có lỗi xảy ra ${error}`,
      });
    }
  },
};
