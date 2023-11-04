var multer = require("multer");
var cloudinary = require("cloudinary").v2;
var imageMiddleware = require("../middleware/image-middleware");
const Facilities = require("../models/facilities.model.js");
const fs = require("fs");

module.exports = {
  facilitiesUploadForm: function (req, res) {
    res.render("upload-form");
  },
  facilitiesStorage: function (req, res) {
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
        var inputValues = {
          image: imageName,
          name: req.body.name,
          location: req.body.location,
          phone: req.body.phone,
          logo: req.body.logo,
          title: req.body.title,
          createdAt: new Date()
        };
        // call model
        Facilities.create(inputValues, function (data) {
          // res.render("upload-form", { alertMsg: data });
          res.send({
            message: "Tạo khách sạn thành công",
            status: 200
          })
        });
      }
    });
  },
  facilitiesGetById: function(req, res) {
    Facilities.getById((err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving TypeRooms."
        });
      else res.status(200).send(data);
    });
  },
  updateFacility: function (req, res) {
    try {
      var upload = multer({
        storage: imageMiddleware.image.storage(),
        allowedImage: imageMiddleware.image.allowedImage,
      }).single("image");
      var inputValues = {};
      upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          res.send(err);
        } else if (err) {
          res.send(err);
        } else {
          let dataImage = "";
          // store image in database
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

          inputValues = {
            image: dataImage,
            name: req.body.name,
            location: req.body.location,
            phone: req.body.phone,
            logo: req.body.logo,
            title: req.body.title,
            updatedAt: new Date()
          };
        }
        Facilities.updateFacility(
            req.params.id,
            new Facilities(inputValues),
            (data, err) => {
              if (err) {
                if (err.kind === "not_found") {
                  res.status(404).json({
                    message: `Not found Facilities with id ${req.params.id}.`,
                  });
                } else {
                  res.status(500).json({
                    message: "Error updating Facilities " + err,
                  });
                }
              } else res.status(200).json({
                message: "Update successfully",
                data: data
              });
            }
          );
      });

      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating facility",
        error: error.message,
      });
    }
  },
};
