var multer = require("multer");
var imageMiddleware = require("../middleware/image-middleware");
const jsonwebtoken = require("jsonwebtoken");
const Employee = require("../models/employee.model.js");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
var imageMiddleware = require("../middleware/image-middleware");
var multer = require("multer");
var cloudinary = require("cloudinary").v2;

exports.register = (req, res, next) => {
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
      res.status(400).send(err);
    } else if (err) {
      res.status(400).send(err);
    } else {
      try {
        let avatar = req.body.image;
        let statusJson = req.body.status;
        let genderJson = req.body.gender;
        const imagePath = JSON.parse(avatar);
        const statusPath = JSON.parse(statusJson);
        const genderPath = JSON.parse(genderJson);

        let dataImage = "";
        await cloudinary.uploader
          .upload(
            imagePath
              ? `G:/ProjectHou/images/p2/${imagePath.path}`
              : req.body.image
          )
          .then((result) => (dataImage = result.url))
          .catch((err) => console.log("err", err));

        const fullname = req.body.fullname || "";
        const email = req.body.email || "";
        const phonenumber = req.body.phonenumber || "";
        const code = req.body.code || "";
        const address = req.body.address || "";
        const birthday = req.body.birthday || "";
        const status = statusPath === "active" ? 1 : 0 || 0;
        const gender = genderPath;
        const role_id = req.body.role_id || null;
        let password = req.body.password;

        const salt = genSaltSync(10);
        password = hashSync(password, salt);

        const data = {
          fullname,
          email,
          phonenumber,
          code,
          dataImage,
          address,
          gender,
          birthday,
          password,
          status,
          role_id,
        };

        Employee.regiser(data, (err, data) => {
          if (err)
            res.status(500).send({
              message:
                err.message ||
                "Some error occurred while creating the Employee.",
            });
          else {
            const jsontoken = jsonwebtoken.sign(
              { data: data },
              process.env.JWT_SECRET,
              { expiresIn: "1d" }
            );
            res.cookie("token", jsontoken, {
              httpOnly: true,
              secure: true,
              SameSite: "strict",
              expires: new Date(Number(new Date()) + 30 * 24 * 60 * 60 * 1000),
            }); //we add secure: true, when using https.

            res.status(200).send({ token: jsontoken, data: data });
          }
        });
      } catch (err) {
        // Handle the error, such as sending an error response
        res.status(400).send({ message: err });
      }
    }
  });
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.passwordHash;

    user = await Employee.getEmployeeByEmail(email);
    if (!user) {
      return res.status(400).send({
        message: "Invalid email or password",
      });
    } else {
      const isValidPassword = compareSync(password, user.passwordHash);
      if (isValidPassword) {
        user.passwordHash = undefined;
        const jsontoken = jsonwebtoken.sign(
          { data: user },
          process.env.JWT_SECRET,
          {
            algorithm: "HS256",
            expiresIn: "30d",
          }
        );
        res.cookie("token", jsontoken, {
          httpOnly: true,
          secure: true,
          SameSite: "strict",
          expires: new Date(Number(new Date()) + 30 * 24 * 60 * 60 * 1000),
        }); //we add secure: true, when using https.

        res.status(200).send({ token: jsontoken, user: user });
      } else {
        return res.status(500).send({
          status: 500,
          message: "Invalid email or password",
        });
      }
    }
  } catch {
    return res.status(400).send({
      message: "Invalid email or password",
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
      message: "Internal Server Error",
    });
  }
};

exports.createFormRoom = (req, res) => {
  res.render("upload-form");
};
exports.update = async (req, res, next) => {
  try {
    var upload = multer({
      storage: imageMiddleware.image.storage(),
      allowedImage: imageMiddleware.image.allowedImage,
    }).single("avatar");

    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        res.status(404).send(err);
      } else if (err) {
        res.status(404).send(err);
      } else {
        console.log('req.body', req.body)
        let dataImage = "";
        // store image in database
        const fullname = req.body.fullname;
        const email = req.body.email;
        const phonenumber = req.body.phonenumber;
        const status = req.body.status;
        const address = req.body.address;
        const birthday = req.body.birthday;
        const gender = req.body.gender || 0;
        const code = req.body.code;
        const role_id = req.body.role_id;
        const createAt = new Date();

        let imageName = req.body.avatar;
        const containsCloudinary = imageName?.indexOf("res.cloudinary.com") !== -1;
        if(containsCloudinary){
          dataImage = imageName
        }else {
          const imagePath = JSON.parse(imageName);
          await cloudinary.uploader
          .upload(
            imagePath.path
              ? `G:/ProjectHou/images/p2/${imagePath.path}`
              : req.body.image
          )
          .then((result) => (dataImage = result.url))
          .catch((err) => console.log("err", err));
        }

        const data = {
          fullname,
          email,
          phonenumber,
          status,
          address,
          birthday,
          avatar: dataImage,
          role_id,
          code,
          gender,
          createAt,
        };

        const userId = req.params.id;

        if (!email || !role_id || !code) {
          return res.status(404).send({
            status: 404,
            message: "Thiếu dữ liệu yêu cầu",
          });
        } else {
          // Kiểm tra xem email hoặc code đã tồn tại chưa
          try {
           
            Employee.updateProfile(data, userId);

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
      }
    });
  } catch (e) {
    return res.status(404).send({
      status: 404,
      message: `Không có nhân viên ${e}`,
    });
  }
};

exports.updateQuick = async (req, res, next) => {
  try {
    const fullname = req.body.name;
    const email = req.body.email;
    const phonenumber = req.body.phoneNumber;
    const status = req.body.status;
    const address = req.body.address;
    const birthday = req.body.birthday;
    const code = req.body.zipCode;
    const role_id = req.body.role;
    const gender = req.body.gender;

    const inputDate = new Date(birthday);
    const formattedDate = inputDate.toString();

    const data = {
      fullname,
      email,
      phonenumber,
      status,
      address,
      formattedDate,
      role_id,
      gender,
      code,
    };
    console.log("req", req.body);

    const userId = req.params.id;

    if (!email || !role_id || !code) {
      return res.status(400).send({
        status: 400,
        message: "Thiếu dữ liệu yêu cầu",
      });
    } else {
      // Kiểm tra xem email hoặc code đã tồn tại chưa
      try {
        const isEmailCodeExist = await Employee.checkEmailCodeExist(
          email,
          code,
          userId
        );

        if (isEmailCodeExist) {
          return res.status(400).send({
            status: 400,
            message: "Email hoặc code đã tồn tại trong hệ thống",
          });
        }

        Employee.updateProfileQuick(data, userId, (err, data) => {
          if (err) {
            res.status(400).send({
              message: err,
            });
          } else {
            res.status(200).send({
              message: "Cập nhật thông tin thành công",
              data: data,
            });
          }
        });
      } catch (error) {
        return res.status(500).send({
          status: 500,
          message: `Lỗi khi kiểm tra email hoặc code: ${error}`,
        });
      }
    }
  } catch (e) {
    return res.status(400).send({
      status: 500,
      message: `Không có nhân viên ${e}`,
    });
  }
};

exports.listEmployee = async (req, res, next) => {
  try {
    Employee.getAll((err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Employee.",
        });
      else res.status(200).send(data);
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error get orders", error: error.message });
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Đăng xuất thành công" });
  } catch (err) {
    res.status(400).send({
      status: 500,
      message: `Lỗi không thể đăng xuất ${err}`,
    });
  }
};

exports.changePassword = async (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  const userData = req.user.data

  const { currentPassword, newPassword } = req.body;

  const data = await Employee.checkEmailExist(userData.id);

  try {
   
    const isPasswordValid = await compareSync(currentPassword, data[0]?.passwordHash);

    if (!isPasswordValid) {
      return res.status(403).json({ error: 'Invalid current password' });
    }

    const hashedNewPassword = await hashSync(newPassword, 10);
    const passData = {
      id: userData.id, hashedNewPassword
    }

    await Employee.updatePassword( passData, (err,data) => {
      if (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Password updated successfully
      res.status(200).json({ message: 'Password updated successfully' });
    });

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};