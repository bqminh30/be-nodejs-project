var multer = require("multer");
module.exports.image = {
  storage: function () {
    var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "public/images/");
      },
      filename: function (req, file, cb) {
        cb(null, `image-${Date.now()}.${file.originalname}`);
      },
    });
    return storage;
  },
  allowedImage: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = "Only image files are allowed!";
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
};

// const multer = require('multer');

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// module.exports = upload.single('image');
