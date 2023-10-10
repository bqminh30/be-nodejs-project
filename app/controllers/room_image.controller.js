const RoomImage = require("../models/room_image.model.js");
var imageMiddleware = require("../middleware/image-middleware");
var multer = require("multer");
const fs = require("fs");
const connection = require("../config/db.js");

module.exports = {
  roomImageUpload: function (req, res) {
    res.render("upload-form");
  },
  roomImageCreate: function (req, res) {
    try {
      console.log('Rota registrar');
        console.log('REQ.query....' + req.params.name);
        // res.status(500).send('testing');
      const room_id = req.body.room_id;
      const count = req.body.count;
      console.log('count', req.body)

      for (let i = 0; i < 5; i++) {
        const fieldname = `data[${i}]`;
        const multi_upload = multer({
          storage: imageMiddleware.image.storage(),
          allowedImage: imageMiddleware.image.allowedImage,
          limits: { fileSize: 1 * 1024 * 1024 }, // 1M
        }).single(fieldname);

        multi_upload(req, res, async function (err) {
          if (err instanceof multer.MulterError) {
            // Handle Multer errors
            return res.status(500).send({
              error: { message: `Multer uploading error: ${err.message}` },
            });
          } else if (err) {
            // Handle other errors
            if (err.name == "ExtensionError") {
              return res.status(413).send({ error: { message: err.message } });
            } else {
              return res.status(500).send({
                error: { message: `unknown uploading error: ${err.message}` },
              });
            }
          }

          // Check if the file was uploaded successfully
          if (!req.file) {
            return res.status(400).send({
              message: `No image file was uploaded for ${fieldname}.`,
              status: 400,
            });
          }

          // Process the uploaded file
          try {
            return new Promise(async (resolve, reject) => {
              const inputValues = new RoomImage({
                name: req.file.originalname,
                type: req.file.mimetype,
                data: req.file.size,
                room_id: room_id,
                updatedAt: new Date(),
              });
              console.log("inpuit", inputValues);

              await RoomImage.create(inputValues, function (err, data) {
                if (err) {
                  reject(err);
                } else {
                  resolve(data);
                }
              });
            });

          } catch (error) {
            return res.status(500).send({
              message: `Failed to process image for ${fieldname}.`,
              status: 500,
            });
          }

          // If all promises are resolved, send the response
          if (promises.length === count) {
            res.status(200).send({
              message: "Successfully uploaded room images",
              status: 200,
              data: promises,
            });
          }
        });
      }
    } catch (error) {
      res.status(500).send({ message: `Có lỗi xảy ra ${error}` });
    }finally{
      // connection.destroy()
      console.log('connection.destroy()')
    }
  },

  roomImageUpdate: function (req, res) {
    try {
      const room_id = req.params.id; // Lấy room_id từ request

      const multi_upload = multer({
        storage: imageMiddleware.image.storage(),
        allowedImage: imageMiddleware.image.allowedImage,
        limits: { fileSize: 1 * 1024 * 1024 }, // 1M
      }).array("data", 5);
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
