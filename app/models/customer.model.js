const sql = require("../config/db.js");

const Customer = function (customer) {
  this.fullname = customer.fullname;
  this.phonenumber = customer.phonenumber;
  this.code = customer.code;
  this.passwordHash = customer.passwordHash;
  this.address = customer.address;
  this.birthday = customer.birthday;
  this.avatar = customer.avatar;
  this.gender = customer.gender;
  this.email = customer.email;
  this.createdAt = customer.createdAt;
  this.updatedAt = customer.updatedAt;
};

Customer.regiser = (newcustomer, result) => {
  sql.query(
    "SELECT COUNT(*) AS cnt FROM customer WHERE email = ? ",
    newcustomer.email,
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
            "INSERT INTO customer (fullname, email, passwordHash, createdAt, updatedAt) VALUES (?,?,?,?,?)",
            [
              newcustomer.fullname,
              newcustomer.email,
              newcustomer.password,
              new Date(),
              new Date()
            ],
            (err, res) => {
              if (err) {
                result({
                  status: 400,
                  message: `Lỗi ${err}`,
                });
                return;
              }

              console.log("created customer: ", {
                id: res.insertId,
                ...newcustomer,
              });
              result(null, { id: res.insertId, ...newcustomer });
            }
          );
        }
      }
    }
  );
};
const checkEmailExistence = (email) => {
  return new Promise((resolve, reject) => {
    const queryCustomer = "SELECT * FROM customer WHERE email = ?";
    const queryEmployee = "SELECT * FROM employee WHERE email = ?";

    // Check in customer table
    sql.query(queryCustomer, email, (errorCustomer, resCustomer) => {
      if (errorCustomer) {
        return reject(errorCustomer);
      }
      if (resCustomer.length > 0) {
        return resolve({ exists: true, table: 'customer' });
      }

      // Check in employee table
      sql.query(queryEmployee, email, (errorEmployee, resEmployee) => {
        if (errorEmployee) {
          return reject(errorEmployee);
        }
        if (resEmployee.length > 0) {
          return resolve({ exists: true, table: 'employee' });
        }

        return resolve({ exists: false });
      });
    });
  });
};

Customer.getCustomerByEmail = (email) => {
  return new Promise((resolve, reject) => {
    sql.query("SELECT * FROM customer WHERE email = ?", email, (error, res) => {
      if (error) {
        return reject(error);
      }
      return resolve(res[0]);
    });
  });
};


Customer.checkEmailCodeExist = (email, code, userId) => {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT COUNT(*) AS count
        FROM customer
        WHERE (email = ? OR code = ?) AND id != ?
      `;
    sql.query(query, [email, code, userId], (error, res) => {
      console.log("res", error, res);
      if (error) {
        return reject(error);
      }
      return resolve(res[0].count);
    });
  });
};

Customer.updateProfile = (data, userId) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "UPDATE customer SET fullname = ?,phonenumber = ?, email = ?, gender=?,code = ?, address = ?, birthday = ?, updatedAt =? WHERE id = ?",
      [
        data.fullname,
        data.phonenumber,
        data.email,
        data.code,
        data.address,
        data.birthday,
        data.updatedAt,
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

Customer.checkEmailExist = (id) => {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT *
        FROM customer
        WHERE id = ? 
      `;
    sql.query(query, id, (error, res) => {
      if (error) {
        return reject(error);
      }
      return resolve(res);
    });
  });
};

Customer.updatePassword = (data, result) => {
  sql.query(
    "UPDATE customer SET passwordHash = ? WHERE id = ?",
    [
      data.hashedNewPassword,
      data.id,
    ],
    (err, res) => {
      if (err) {
        result(err);
        return;
      }
      result(null, res);
    }
  );

}

module.exports = Customer;
