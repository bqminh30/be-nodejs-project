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

        for (const file of files) {
          // Ảnh ở đây là dưới dạng base64, bạn có thể giữ nó như vậy
          let dataImage = file.preview;

          try {
            // Tải ảnh lên Cloudinary hoặc nơi lưu trữ tương tự
            const result = await cloudinary.uploader.upload(dataImage, {
              // Cấu hình Cloudinary nếu cần
            });
            dataImage = result.url;
          } catch (err) {
            console.log("Error uploading to Cloudinary:", err);
          }

          const inputValues = {
            name: file.path,
            data: dataImage,
            room_id: room_id,
            createdAt: new Date(),
          };

          const promise = new Promise((resolve, reject) => {
            RoomImage.create(inputValues, (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            });
          });

          promises.push(promise);
        }

        try {
          await Promise.all(promises);
          res.status(200).send({
            message: "Room images updated successfully",
            status: 200,
          });
        } catch (error) {
          res.status(500).send({
            message: "Failed to update room images",
            status: 500,
            data: error,
          });
        }
      });
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: `An error occurred: ${error}`,
      });
    }
  },
  roomImageUpdate: function (req, res) {
    try {
      const multi_upload = multer({
        storage: imageMiddleware.image.storage(),
        allowedImage: imageMiddleware.image.allowedImage,
        limits: { fileSize: 1 * 1024 * 1024 }, // 1M
      }).array("roomImage", 5);
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
          const files = req.files;

          if (!files || files.length === 0) {
            return res.status(400).send({
              message: "Không có tệp ảnh để cập nhật.",
              status: 400,
            });
          }
          console.log("files", files);

          const promises = [];
          // files.map(async (file) => {
          //   return new Promise((resolve, reject) => {
          //     // Bước 1: Xóa tất cả các ảnh trong thư mục "public/images" có room_id trùng với room_id cần cập nhật
          //     const imageDir = `public/images}`;
          //     if (fs.existsSync(imageDir)) {
          //       fs.readdirSync(imageDir).forEach((f) => {
          //         const filePath = `${imageDir}/${f}`;
          //         fs.unlinkSync(filePath); // Xóa tệp ảnh
          //       });
          //     }

          //     RoomImage.deleteImagesByRoomId(room_id, function (err, data) {
          //       if (err) {
          //         reject(err);
          //       } else {
          //         resolve(data);
          //       }
          //     });
          //   });
          // });

          // Bước 2: Xóa tất cả các ảnh có room_id trùng với room_id cần cập nhật trong cơ sở dữ liệu

          // Bước 3: Thêm mới ảnh
          files.forEach((file) => {
            return new Promise((resolve, reject) => {
              const inputValues = {
                name: file.originalname,
                type: file.mimetype,
                data: file.size,
                room_id: room_id,
                updatedAt: new Date(),
              };

              const promise = RoomImage.create(
                inputValues,
                function (err, data) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(data);
                  }
                }
              );

              promises.push(promise);
            });
          });

          try {
            const createdImages = await Promise.all(promises);
            res.status(200).send({
              message: "Cập nhật ảnh phòng thành công",
              status: 200,
              data: createdImages,
            });
          } catch (error) {
            res.status(500).send({
              message: "Cập nhật ảnh phòng thất bại",
              status: 500,
              data: error,
            });
          }
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
