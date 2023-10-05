const sql = require("../config/db.js");
const Service = require("./service.model")
const Room_Image = require("./room_image.model")

const currentDate = new Date();
// constructor
const Rooms = function (value) {
  this.name = value.name;
  this.title = value.title;
  this.description = value.description;
  this.price = value.price;
  this.priceSale = value.priceSale;
  this.rating = value.rating;
  this.totalRating = value.totalRating;
  this.totalReview = value.totalReview;
  this.numberBed = value.numberBed;
  this.numberPeople = value.numberPeople;
  this.status = value.status;
  this.label = value.label;
  this.isLiked = value.isLiked;
  this.image = value.image;
  this.voucher_id = value.rating;
  this.type_room_id = value.type_room_id;
  this.createdAt = new Date();
  this.updatedAt = new Date();
};

Rooms.createRoom = (newRoom, result) => {
  sql.query("INSERT INTO room SET ?", newRoom, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created room: ", { id: res.insertId, ...newRoom });
    result(null, { id: res.insertId, ...newRoom });
  });
};

Rooms.createRoomDeatil = (data, result) => {
  
}

Rooms.updateRoomById = (id, value, result) => {
  sql.query(
    "UPDATE room SET " +
      "name=?, title=?, description=?, price=?, numberBed =?, numberPeople =?, " +
      "status= ?,label=?, isLiked=?, image=?,voucher_id=?,type_room_id=?, updatedAt=? WHERE id = ?",
    [
      value.name,
      value.title,
      value.description,
      value.price,
      // value.rating,
      // value.totalRating,
      // value.totalReview,
      value.numberBed,
      value.numberPeople,
      value.status,
      value.label,
      value.isLiked,
      value.image,
      value.voucher_id,
      value.type_room_id,
      value.updatedAt,
      id,
    ],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);

        return;
      }
      console.log("updated room: ", { id: id, ...value });
      result({ id: id, ...value });
    }
  );
};

Rooms.updatePriceSale = (newPrice, newVoucherId, roomIdToUpdate, result) => {
  sql.query(
    "SELECT value, startDate, endDate FROM vouchers WHERE id = ?",
    [newVoucherId],
    (voucherErr, voucherRes) => {
      if (voucherErr) {
        console.log("Error fetching voucher information: ", voucherErr);
        result(null, voucherErr);
        return;
      }

      if (voucherRes.length === 0) {
        console.log("Voucher not found");
        result(null, "Voucher not found");
        return;
      }

      const voucherData = voucherRes[0];
      const voucherValue = voucherData.value;
      const startDate = new Date(voucherData.startDate);
      const endDate = new Date(voucherData.endDate);

      // Kiểm tra xem ngày hiện tại có nằm trong khoảng từ startDate đến endDate không
      if (currentDate >= startDate && currentDate <= endDate) {
        // Tính giá trị "priceSale" mới dựa trên giá "newPrice" và giảm giá từ voucher
        const priceSale = newPrice * (1 - voucherValue / 100);

        // Thực hiện truy vấn cập nhật giá trị "priceSale" mới
        sql.query(
          `UPDATE room SET price = ?, priceSale = ? WHERE id = ?`,
          [newPrice, priceSale, roomIdToUpdate],
          (updateErr, updateRes) => {
            if (updateErr) {
              console.log("Error updating priceSale: ", updateErr);
              result(null, updateErr);
            } else {
              console.log(
                "Updated priceSale for room with id: ",
                roomIdToUpdate
              );
              result(updateRes);
            }
          }
        );
      } else {
        // Nếu ngày hiện tại không nằm trong khoảng startDate và endDate, không thay đổi "priceSale"
        console.log(
          "Current date is not within the range of startDate and endDate"
        );
        result(null, "No changes to priceSale");
      }
    }
  );
};

Rooms.findRoomById = (id, result) => {
  sql.query(
    `SELECT r.*, 
        CONCAT('[', GROUP_CONCAT('{"id":', s.id, ',"name":"', s.name, '"}' SEPARATOR ','), ']') AS service,
        room_image.roomImages
        FROM room r 
          LEFT JOIN room_service rs ON r.id = rs.room_id 
          LEFT JOIN service s ON rs.service_id = s.id 
          LEFT JOIN (
            SELECT room_id, CONCAT('[', GROUP_CONCAT('{"id":', room_image.id, ',"name":"', room_image.name, '" }' SEPARATOR ','), ']') AS roomImages
        FROM room_image
          GROUP BY room_id
        ) room_image ON room_image.room_id = r.id WHERE r.id = ${id}
    GROUP BY r.id;
    `,
    (err, res) => {
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
      result({ kind: "not_found" }, null);
    }
  );
};

Rooms.getAll = (title, result) => {
  let query = `SELECT r.*, 
  CONCAT('[', GROUP_CONCAT('{"id":', s.id, ',"name":"', s.name, '"}' SEPARATOR ','), ']') AS service,
  room_image.roomImages
FROM room r 
LEFT JOIN room_service rs ON r.id = rs.room_id 
LEFT JOIN service s ON rs.service_id = s.id 
LEFT JOIN (
  SELECT room_id, CONCAT('[', GROUP_CONCAT('{"id":', room_image.id, ',"name":"', room_image.name, '" }' SEPARATOR ','), ']') AS roomImages
  FROM room_image
  GROUP BY room_id
) room_image ON room_image.room_id = r.id
GROUP BY r.id;
`;

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("rooms: ", res);
    result(null, res);
  });
};

Rooms.findByLabel = (data, result) => {
  sql.query(`SELECT * FROM room WHERE label = ${data}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("room: ", res);
    result(null, res);
  });
};

Rooms.getRoomsByRoomTypeId = (id, result) => {
  sql.query(`SELECT * FROM room where type_room_id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    } else {
      result(null, res);
    }
  });
};

module.exports = Rooms;
