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
        const originalnames = req.files
          .map((file) => file.originalname)
          .join(", "); // Tạo chuỗi từ originalnames
        const room_id = req.body.room_id; // Lấy room_id từ request body
        console.log('originalnames', originalnames)
        var inputValues = {
          name: originalnames,
          room_id: room_id,
          createdAt: new Date(),
        };
        RoomImage.create(inputValues, function (err, data) {
          if(err){
            res.send({
                message: "Tạo ảnh phòng that bai",
                status: 404,
                data: err,
              });
          }else {
            res.send({
                message: "Tạo ảnh phòng thành công",
                status: 200,
                data: data,
              });
          }
        });
        // res.status(200).end("Your files uploaded.");
      });
    } catch (error) {
      res.send({
        status: 500,
        message: `Có lỗi xảy ra ${error}`,
      });
    }
  },
};
