var multer = require("multer");
var imageMiddleware = require("../middleware/image-middleware");
const jsonwebtoken = require("jsonwebtoken");
const Customer = require("../models/customer.model.js");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
var fs = require("fs");
var path = require("path");
var cloudinary = require("cloudinary").v2;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("avatar");

exports.register = async (req, res, next) => {
  try {
    const fullname = req.body.fullname;
    const email = req.body.email;
    let password = req.body.passwordHash;

    if (!fullname || !email || !password) {
      res.status(400).send({
        message: "Value not empty!",
      });
      return;
    }
    const salt = genSaltSync(10);
    password = hashSync(password, salt);

    const data = {
      fullname,
      email,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
      user = await Customer.getCustomerByEmail(email);
      if (user) {
        return res.status(401).send({
          message: "Email already exists",
        });
      } else {
        await Customer.regiser(data, (err, data) => {
          if (err)
            res.status(500).send({
              message:
                err.message ||
                "Some error occurred while creating the Customer.",
            });
          else {
            const jsontoken = jsonwebtoken.sign(
              { data: data },
              process.env.JWT_SECRET,
              { expiresIn: "30d" }
            );
            res.cookie("token", jsontoken, {
              httpOnly: true,
              secure: true,
              SameSite: "strict",
              expires: new Date(Number(new Date()) + 30 * 60 * 1000),
            }); //we add secure: true, when using https.

            res.send({ token: jsontoken, data: data });
          }
        });
      }
    } catch (err) {
      return res.status(401).send({
        message: "Email already exists",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Error!!!",
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.passwordHash;

    const user = await Customer.getCustomerByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isValidPassword = compareSync(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    user.passwordHash = undefined;
    const jsontoken = jsonwebtoken.sign(
      { data: user },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", jsontoken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: new Date(Number(new Date()) + 30 * 60 * 1000),
    });

    res.send({ token: jsontoken, data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Assuming cloudinary and other necessary modules are correctly imported

exports.updateCustomer = (req, res) => {
  var upload = multer({
    storage: imageMiddleware.image.storage(),
    allowedImage: imageMiddleware.image.allowedImage,
  }).single("avatar");
  upload(req, res, async function (err) {
    try {
      if (err instanceof multer.MulterError) {
        res.status(400).send(err);
      } else if (err) {
        res.status(404).send(err);
      } else {
        const {
          fullname,
          email,
          phonenumber,
          status,
          address,
          birthday,
          gender,
          code,
        } = req.body;
        const imageName = req.file.filename;
        const data = {
          fullname,
          email,
          phonenumber,
          status,
          address,
          birthday,
          avatar: imageName,
          code,
          gender,
          status: 1,
          address
        };
        console.log('data', data)

        const userId = req.params.id;

        try {
          await Customer.updateProfile(data, userId);

          res.status(200).send({
            status: 200,
            message: "Cập nhật thông tin thành công",
          });
        } catch (error) {
          return res.status(400).send({
            status: 404,
            message: `Lỗi khi kiểm tra email hoặc code: ${error}`,
          });
        }
      }
    } catch (e) {
      return res.status(404).send({
        status: 404,
        message: `Không có nhân viên ${e}`,
      });
    }
  });
};

// exports.updateCustomer = (req, res) => {
//   upload(req, res, async function (err) {
//     try {
//       if (err instanceof multer.MulterError) {
//         return res.status(400).send({ error: 'Multer error' });
//       } else if (err) {
//         return res.status(400).send({ error: err.message });
//       }

//       const { fullname, email, phonenumber, birthday, gender, code } = req.body;
//       let avatar = '';

//       if (req.file) {
//         // Uploading image to Cloudinary if a file is present
//         const result = await cloudinary.uploader.upload(req.file.buffer, {
//           folder: 'your_folder_name', // Replace with your desired folder name
//         });
//         avatar = result.secure_url;
//       }

//       // Perform your update logic here using the received data
//       // For example, update the customer's information in the database

//       res.status(200).json({ message: 'Customer updated successfully', avatar });
//     } catch (error) {
//       res.status(500).json({ error: 'Server error' });
//     }
//   });
// };

exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Đăng xuất thành công" });
  } catch (err) {
    res.status(500).send({
      message: `Lỗi không thể đăng xuất ${err}`,
    });
  }
};

exports.isAuth = async (req, res, next) => {
  try {
    const tokenFromClient =
      req.body.token || req.query.token || req.headers["authorization"];
    if (tokenFromClient) {
      if (!tokenFromClient) {
        return res.status(403).send({ message: "No token provided!" });
      }

      const bearerToken = tokenFromClient.split(" ")[1];
      const isCheckToken = jsonwebtoken.verify(
        bearerToken,
        process.env.JWT_SECRET
      );
      if (isCheckToken.data) {
        return res.status(200).json({
          user: isCheckToken.data,
        });
      }
    } else {
      // No token found in the request, return a 403 (Forbidden) status code
      return res.status(403).json({
        message: "No token provided.",
      });
    }
  } catch (err) {
    // Handle any other unexpected errors and return a 500 (Internal Server Error) status code
    console.error(err);
    res.status(500).json({
      message: "TokenExpiredError: jwt expired",
    });
  }
};

exports.changePassword = async (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  const userData = req.user.data;

  const { currentPassword, newPassword } = req.body;

  const data = await Customer.checkEmailExist(userData.id);
  console.log("userData", data);
  try {
    const isPasswordValid = await compareSync(
      currentPassword,
      data[0]?.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(403).json({ error: "Invalid current password" });
    }

    const hashedNewPassword = await hashSync(newPassword, 10);
    const passData = {
      id: userData.id,
      hashedNewPassword,
    };

    await Customer.updatePassword(passData, (err, data) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Password updated successfully
      res.status(200).json({ message: "Password updated successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
