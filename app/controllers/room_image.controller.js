const RoomImage = require("../models/room_image.model.js");
var imageMiddleware = require("../middleware/image-middleware");
var multer = require("multer");
var cloudinary = require("cloudinary").v2;
const fs = require("fs");

module.exports = {
  roomImageUpload: function (req, res) {
    res.render("upload-form");
  },
  roomImageCreate: async function (req, res) {
    try {
      const multi_upload = multer({
        storage: imageMiddleware.image.storage(),
        allowedImage: imageMiddleware.image.allowedImage,
        limits: { fileSize: 10 * 1024 * 1024 }, // 1M
      }).array("roomImage", 10);

      multi_upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          // Handle Multer error
          return res.status(500).send({
            error: { message: `Multer uploading error: ${err.message}` },
          });
        } else if (err) {
          // Handle other errors
          return res.status(500).send({
            message: "An error occurred while uploading images.",
            status: 500,
          });
        }

        const files = JSON.parse(req.body.roomImage); // Sử dụng req.files để truy cập các tệp đã tải lên
        const room_id = req.body.room_id;
        const promises = [];

        if (!files || files.length === 0) {
          return res.status(400).send({
            message: "No image files to update.",
            status: 400,
          });
        }

        // for (const file of files) {
        //   // Ảnh ở đây là dưới dạng base64, bạn có thể giữ nó như vậy
        //   let dataImage = file.path;
        //   try {
        //     // Tải ảnh lên Cloudinary hoặc nơi lưu trữ tương tự
        //     const result = await cloudinary.uploader.upload(
        //       dataImage ?  `G:/ProjectHou/images/p1/${dataImage}` : ,
        //       {
        //         // Cấu hình Cloudinary nếu cần
        //       }
        //     );
        //     dataImage = result.url;
        //   } catch (err) {
        //     console.log("Error uploading to Cloudinary:", err);
        //   }

        //   const inputValues = {
        //     name: file.path,
        //     data: dataImage,
        //     room_id: room_id,
        //     createdAt: new Date(),
        //   };

        //   const promise = new Promise((resolve, reject) => {
        //     RoomImage.create(inputValues, (err, data) => {
        //       if (err) {
        //         reject(err);
        //       } else {
        //         resolve(data);
        //       }
        //     });
        //   });

        //   promises.push(promise);
        // }

        // try {
        //   await Promise.all(promises);
        //   res.status(200).send({
        //     message: "Room images updated successfully",
        //     status: 200,
        //   });
        // } catch (error) {
        //   res.status(500).send({
        //     message: "Failed to update room images",
        //     status: 500,
        //     data: error,
        //   });
        // }
      });
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: `An error occurred: ${error}`,
      });
    }
  },

  // update images
  roomImageUpdate: function (req, res) {
    try {
      const multi_upload = multer({
        storage: imageMiddleware.image.storage(),
        allowedImage: imageMiddleware.image.allowedImage,
        limits: { fileSize: 1 * 1024 * 1024 }, // 1M
      }).array("roomImage", 10);
      // Xóa các ảnh cũ trong thư mục public/images liên quan đến phòng

      multi_upload(req, res, async function (err) {
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
        } else {
          const promises = [];
          const files = JSON.parse(req.body.roomImage);

          console.log('files', files, req.body.roomImage)
          const roomId = req.body.id;

          if (!files || files.length === 0) {
            return res.status(400).send({
              message: "Không có tệp ảnh để cập nhật.",
              status: 400,
            });
          }

         

          // RoomImage.deleteImagesByRoomId(roomId, (err, data) => {
          //   console.log("log", err, data);
          // });

          // for (const file of files) {
          //   // Ảnh ở đây là dưới dạng base64, bạn có thể giữ nó như vậy
          //   let dataImage = file.path;
          //   try {
          //     // Tải ảnh lên Cloudinary hoặc nơi lưu trữ tương tự
          //     const result = await cloudinary.uploader.upload(
          //       `G:/ProjectHou/images/p1/${dataImage}`,
          //       {
          //         // Cấu hình Cloudinary nếu cần
          //       }
          //     );
          //     dataImage = result.url;
          //   } catch (err) {
          //     console.log("Error uploading to Cloudinary:", err);
          //   }

          //   const inputValues = {
          //     name: file.path,
          //     data: dataImage,
          //     room_id: roomId,
          //     createdAt: new Date(),
          //   };

          //   const promise = new Promise((resolve, reject) => {
          //     RoomImage.create(inputValues, (err, data) => {
          //       if (err) {
          //         reject(err);
          //       } else {
          //         resolve(data);
          //       }
          //     });
          //   });

          //   promises.push(promise);
          // }

          // try {
          //   await Promise.all(promises);
          //   res.status(200).send({
          //     message: "Room images updated successfully",
          //     status: 200,
          //   });
          // } catch (error) {
          //   res.status(500).send({
          //     message: "Failed to update room images",
          //     status: 500,
          //     data: error,
          //   });
          // }
        }
      });
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: `Có lỗi xảy ra ${error}`,
      });
    }
  },
};
