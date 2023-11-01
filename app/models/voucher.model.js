const sql = require("../config/db.js");

// constructor
const Vouchers = function (value) {
  this.name = value.name;
  this.value = value.value;
  this.isShow = value.isShow;
  this.startDate = value.startDate;
  this.endDate = value.endDate;
  this.updatedAt = value.updatedAt;
  this.createdAt = value.createdAt;
};

Vouchers.create = (newVoucher, result) => {
  sql.query("INSERT INTO vouchers SET ?", newVoucher, (err, res) => {
    if (err) {
      result({
        status: 400,
        message: "Loi insert du lieu voucher"
      });
      return;
    }
    result(null, { id: res.insertId, ...newVoucher });
  });
};

Vouchers.update = (id, data, result) => {
  sql.query(
    "UPDATE vouchers SET name=?, value=?, startDate=?, endDate=?, updatedAt =? WHERE id = ?",
    [
      data.name,
      data.value,
      data.startDate,
      data.endDate,
      new Date(),
      id,
    ],
    (err, res) => {
      if (err) {
        result({
            status: 400,
            message: "Loi update du lieu voucher"
          });

        return;
      }

      if (res.affectedRows == 0) {
        // not found facilities with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated vouchers: ", { id: id, ...data });
      result({ id: id, ...data });
    }
  );
};

Vouchers.updateShow = (id, data, result) => {
  sql.query(
    "UPDATE vouchers SET isShow = ?, updatedAt = ? WHERE id = ?",
    [
      data.isShow,
      new Date(),
      id,
    ],
    (err, res) => {
      if (err) {
        result({
            status: 400,
            message: "Loi update du lieu voucher"
          });

        return;
      }

      if (res.affectedRows == 0) {
        // not found facilities with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated vouchers: ", { id: id, ...facilities });
      result({ id: id, ...facilities });
    }
  );
};

Vouchers.getAll = (result) => {
  sql.query = ("SELECT * FROM vouchers", (err, res) => {
    console.log('resr',err, res)
    if(err){
      result(null,{
        status: 400,
        message: "Loi select vouchers"
      });
      return;
    }
    result(res);
  })
}

Vouchers.findById = (id, result) => {
  sql.query(`SELECT * FROM vouchers WHERE id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found voucher: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found type service with the id
    result({ kind: "not_found" }, null);
  });
};

Vouchers.getAllPublished = (name, result) => {
  sql.query("SELECT * FROM vouchers WHERE isShow = 1 ;", (err, res) => {
    if(err){
      result(err,null);
      return;
    }
    if (res.affectedRows == 0) {
      // not found Service with the id
      result({ kind: "not_found" }, null);
      return;
    }
    result(null, res);
  });
};

Vouchers.delete = (id) => {
  return new Promise((resolve, reject) => {
    sql.query("DELETE FROM vouchers WHERE id = ?", id, (error, res) => {
      if(error) {
        return reject(`123${error}`)
      }else {
        return resolve()
      }
    })
  })
}

Vouchers.cronJobUpdateShow = () => {
  const query =  `
  UPDATE vouchers
    SET vouchers.isShow = 0
  WHERE vouchers.endDate > ?
  `
  sql.query(query,[new Date()], (err, res) => {
    if(err){
      console.log('err cron job')
    }else {
      console.log('runn cron job')
    }
  })
}

module.exports = Vouchers;
