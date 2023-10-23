var multer = require("multer");
var imageMiddleware = require("../middleware/image-middleware");
const jsonwebtoken = require("jsonwebtoken");
const Employee = require("../models/employee.model.js");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");

exports.register = (req, res, next) => {
  
  try {
    const fullname = req.body.fullname;
    const email = req.body.email;
    const role_id = req.body.role_id;
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
      role_id,
      createdAt: new Date()
    };

    Employee.regiser(data, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Employee.",
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
          expires: new Date(Number(new Date()) + 30 * 60 * 1000),
        }); //we add secure: true, when using https.

        res.send({ token: jsontoken, data: data });
      }
    });
  } catch {
    console.log("errrrrr");
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.passwordHash;

    user = await Employee.getEmployeeByEmail(email);
    if (!user) {
      return res.send({
        message: "Invalid email or password",
      });
    } else {
      const isValidPassword = compareSync(password, user.passwordHash);
      if (isValidPassword) {
        user.passwordHash = undefined;
        const jsontoken = jsonwebtoken.sign(
          { data: user },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );
        res.cookie("token", jsontoken, {
          httpOnly: true,
          secure: true,
          SameSite: "strict",
          expires: new Date(Number(new Date()) + 30 * 60 * 1000),
        }); //we add secure: true, when using https.

        res.send({ token: jsontoken, data: user });
      } else {
        return res.send({
          status: 400,
          message: "Invalid email or password",
        });
      }
    }
  } catch {
    return res.send({
      status: 500,
      message: "Invalid email or password",
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    var upload = multer({
      storage: imageMiddleware.image.storage(),
      allowedImage: imageMiddleware.image.allowedImage,
    }).single("avatar");

    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        res.send(err);
      } else if (err) {
        res.send(err);
      } else {
        // store image in database
        // let imageName = req.file.originalname;
        const fullname = req.body.fullname;
        const email = req.body.email;
        const phonenumber = req.body.phonenumber;
        const status = req.body.status;
        const address = req.body.address;
        const birthday = req.body.birthday;
        // const avatar = imageName;
        const avatar = req.body.avatar;
        const code = req.body.code;
        const role_id = req.body.role_id;
        const createAt = new Date();
        const data = {
          fullname,
          email,
          phonenumber,
          status,
          address,
          birthday,
          avatar,
          role_id,
          code,
          createAt,
        };

        const userId = req.params.id;

        if (!email || !role_id || !code) {
          return res.send({
            status: 400,
            message: "Thiếu dữ liệu yêu cầu",
          });
        } else {
          // Kiểm tra xem email hoặc code đã tồn tại chưa
          try {
            const isEmailCodeExist = await Employee.checkEmailCodeExist(email, code, userId);

            if (isEmailCodeExist) {
              return res.send({
                status: 400,
                message: "Email hoặc code đã tồn tại trong hệ thống",
              });
            }

            Employee.updateProfile(data, userId);

            res.send({
              status: 200,
              message: "Cập nhật thông tin thành công",
            });
          } catch (error) {
            return res.send({
              status: 500,
              message: `Lỗi khi kiểm tra email hoặc code: ${error}`,
            });
          }
        }
      }
    });
  } catch (e) {
    return res.send({
      status: 500,
      message: `Không có nhân viên ${e}`,
    });
  }
};


exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    res.json({ message: 'Đăng xuất thành công' });
  }catch (err){
    res.send({
      status: 500,
      message: `Lỗi không thể đăng xuất ${err}`,
    })
  }
}