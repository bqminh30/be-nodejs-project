const sql = require("../config/db.js");
const jsonwebtoken = require("jsonwebtoken");


const Employee = function (employee) {
  this.fullname = employee.fullname;
  this.phonenumber = employee.phonenumber;
  this.code = employee.code;
  this.passwordHash = employee.passwordHash;
  this.address = employee.address;
  this.birthday = employee.birthday;
  this.avatar = employee.avatar;
  this.status = employee.status;
  this.email = employee.email;
  this.role_id = employee.role_id;
  this.createdAt = new Date();
  this.updatedAt = new Date();
};

Employee.regiser = (newEmployee, result) => {
  // if (newEmployee.role_id !== 2) {
  //   return result({
  //     status: 403,
  //     message: "Only admin users can create employees with the 'staff' role.",
  //   }, null);
  // }

  sql.query(
    "SELECT COUNT(*) AS cnt FROM employee WHERE email = ? ",
    newEmployee.email,
    function (err, data) {
      if (err) {
        result(err, null);
        return;
      } else {
        if (data[0].cnt > 0) {
          result({
            status: 500,
            message: "Email đã bị trùng",
          });
          return;
        } else {
          sql.query(
            "INSERT INTO employee (fullname, email, passwordHash, role_id) VALUES (?,?,?, 1)",
            [newEmployee.fullname, newEmployee.email, newEmployee.password],
            (err, res) => {
              if (err) {
                result({
                  status: 400,
                  message: `Lỗi ${err}`,
                });
                return;
              }

              console.log("created employee: ", {
                id: res.insertId,
                ...newEmployee,
              });
              result(null, { id: res.insertId, ...newEmployee });
            }
          );
        }
      }
    }
  );
};
Employee.getEmployeeByEmail = (email) => {
  return new Promise((resolve, reject) => {
    sql.query("SELECT * FROM employee WHERE email = ?", email, (error, res) => {
      if (error) {
        return reject(error);
      }
      return resolve(res[0]);
    });
  });
};

Employee.checkEmailCodeExist = (email, code, userId) => {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT COUNT(*) AS count
        FROM employee
        WHERE (email = ? OR code = ?) AND id != ?
      `;
    sql.query(query, [email, code, userId], (error, res) => {
      console.log('res', error, res)
      if (error) {
        return reject(error);
      }
      return resolve(res[0].count);
    });
  });
};

Employee.updateProfile = (data, userId) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "UPDATE employee SET fullname = ?,phonenumber = ?, status = ?, email = ?, code = ?, address = ?, birthday = ?, avatar = ?, role_id = ?, createdAt =? WHERE id = ?",
      [
        data.fullname,
        data.phonenumber,
        data.status,
        data.email,
        data.code,
        data.address,
        data.birthday,
        data.avatar,
        data.role_id,
        data.createAt,
        userId,
      ],
      (error, res) => {
        console.log("error", data, userId);
        if (error) {
          return reject(error);
        }
        return resolve();
      }
    );
  });
};

module.exports = Employee;







