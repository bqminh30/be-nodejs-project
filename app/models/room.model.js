const sql = require("../config/db.js");

const currentDate = new Date();
// constructor
const Rooms = function (data) {
  this.name = data.name;
  this.title = data.title;
  this.description = data.description;
  this.price = data.price;
  this.priceSale = data.priceSale;
  this.rating = data.rating;
  this.totalRating = data.totalRating;
  this.totalReview = data.totalReview;
  this.numberBed = data.numberBed;
  this.numberPeople = data.numberPeople;
  this.numberChildren = data.numberChildren;
  this.status = data.status;
  this.label = data.label;
  this.isLiked = data.isLiked;
  this.image = data.image;
  this.type_room_id = data.type_room_id;
  this.createdAt = new Date();
  this.updatedAt = new Date();
};

Rooms.updateVoucherCronJob = (result) => {
  const query = 
  ` UPDATE room
    JOIN vouchers ON room.voucher_id = vouchers.id
    SET room.priceSale = room.price * ((100 - vouchers.value) / 100)
    WHERE room.voucher_id IS NOT NULL
      AND vouchers.startDate <= ?
      AND vouchers.endDate >= ?
      AND vouchers.isShow = 1;
  `;

  sql.query(query,[ new Date(), new Date() ], (err, res) => {
    if(err){
      console.log('errr',err)
      result(err, null)
      return;
    }else {
      console.log('runn')
      result(res)
    }
  })
}

Rooms.updateVoucherCronJob_2 = () => {
  const query = 
  ` UPDATE room
    JOIN vouchers ON room.voucher_id = vouchers.id
    SET room.priceSale = room.price * ((100 - vouchers.value) / 100)
    WHERE room.voucher_id IS NOT NULL
      AND vouchers.startDate <= ?
      AND vouchers.endDate >= ?
      AND vouchers.isShow = 1;
  `;

  sql.query(query,[ new Date(), new Date() ], (err, res) => {
    if(err){
      console.log('errr',err)
    }else {
      console.log('runn')
    }
  })
}


Rooms.createRoom = (newRoom, result) => {
  sql.query("INSERT INTO room SET ?", newRoom, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created room: ", { id: res.insertId, ...newRoom });
    result(null, { id: res.insertId, image: res.image, ...newRoom });
  });
};

Rooms.updateRoomById = (id, value, result) => {
  console.log('value', value)
  sql.query(
    "UPDATE room SET " +
      "name=?, title=?, description=?, price=?,priceSale=?, numberBed =?, numberPeople =?, " +
      "status= ?,label=?, isLiked=?, image=?,numberChildren=?,type_room_id=?, updatedAt=? WHERE id = ?",
    [
      value.name,
      value.title,
      value.description,
      value.price,
      value.priceSale,
      value.numberBed,
      value.numberPeople,
      value.status,
      value.label,
      value.isLiked,
      value.image,
      value.numberChildren,
      value.type_room_id,
      new Date(),
      id,
    ],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
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
        CONCAT('[', IFNULL(GROUP_CONCAT(DISTINCT s.id ORDER BY s.id SEPARATOR ','), ''), ']') AS service,
        IFNULL(room_image.roomImages, '[]') AS roomImages,
        IFNULL(service_data.service_data, '[]') AS service_data
    FROM room r
    LEFT JOIN room_service rs ON r.id = rs.room_id
    LEFT JOIN service s ON rs.service_id = s.id
    LEFT JOIN (
        SELECT room_id, CONCAT('[', GROUP_CONCAT('{"id":', id, ',"name":"', data, '" }' SEPARATOR ','), ']') AS roomImages
        FROM room_image
        GROUP BY room_id
    ) room_image ON room_image.room_id = r.id
    LEFT JOIN (
        SELECT r.id AS room_id, CONCAT('[', GROUP_CONCAT('{"id":', s.id, ',"name":"', s.name, '" }' SEPARATOR ','), ']') AS service_data
        FROM room r
        LEFT JOIN room_service rs ON r.id = rs.room_id
        LEFT JOIN service s ON rs.service_id = s.id
        WHERE r.id = ${id}
        GROUP BY r.id
    ) service_data ON service_data.room_id = r.id
    WHERE r.id = ${id}
    GROUP BY r.id;
    `,
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      // console.log('res', res)

      if (res.length) {
        const resultServicesData = JSON.parse(res[0].service_data);
        const resultServices = JSON.parse(res[0].service);
        const resultImages = JSON.parse(res[0].roomImages);
        

        const dataWithImageArr = {
          ...res[0], // Copy the existing properties from res[0]
          roomImages: resultImages, // Add the new 'imageArr' field
          service: resultServices, // Add the new 'imageArr' field
        };

        result(null, {
          data: dataWithImageArr,
          services: resultServicesData,
        });
        return;
      }
      result({ kind: "not_found" }, null);
    }
  );
};

Rooms.getAll = (title, result) => {
  let query = `SELECT r.*, 
      CONCAT('[', GROUP_CONCAT('{"value":', s.id, ',"label":"', s.name, '"}' SEPARATOR ','), ']') AS service,
      room_image.roomImages
        FROM room r 
        LEFT JOIN room_service rs ON r.id = rs.room_id 
        LEFT JOIN service s ON rs.service_id = s.id 
        LEFT JOIN (
      SELECT room_id, CONCAT('[', GROUP_CONCAT('{"id":', room_image.id, ',"name":"', room_image.data, '" }' SEPARATOR ','), ']') AS roomImages
      FROM room_image
      GROUP BY room_id
        ) room_image ON room_image.room_id = r.id
      GROUP BY r.id;
  `;

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("rooms: ", res);
    if (res.length) {
      const roomsData = res.map((room) => {
        const resultImages = JSON.parse(room.roomImages);
        const resultServices = JSON.parse(room.service);

        return {
          ...room,
          roomImages: resultImages,
          service: resultServices,
        };
      });

      result(null, roomsData);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Rooms.getLimit = (id, result) => {
  let query = `SELECT  r.*, 
  CONCAT('[', GROUP_CONCAT('{"value":', s.id, ',"label":"', s.name, '"}' SEPARATOR ','), ']') AS service,
  room_image.roomImages
   FROM room r 
    LEFT JOIN room_service rs ON r.id = rs.room_id 
    LEFT JOIN service s ON rs.service_id = s.id 
    LEFT JOIN (
  SELECT room_id, CONCAT('[', GROUP_CONCAT('{"id":', room_image.id, ',"name":"', room_image.data, '" }' SEPARATOR ','), ']') AS roomImages
  FROM room_image
  GROUP BY room_id
    ) room_image ON room_image.room_id = r.id
  GROUP BY r.id
  ORDER BY r.rating DESC LIMIT ${id};
`;

sql.query(query, (err, res) => {
if (err) {
  console.log("error: ", err);
  result(err, null);
  return;
}

// console.log("rooms: ", res);
result(null, res);
});
}

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


Rooms.searchRooms = (value, result) => {
  const {
    name,
    startDate,
    endDate,
    numberRooms,
    numberPeople,
    numberChildren,
  } = req.query;

  const conditions = [];
  const values = [];

  if (name) {
    // Check if the name is a number
    const isNumber = !isNaN(name);
    
    if (isNumber) {
      conditions.push('numberRooms >= ?');
      values.push(parseInt(name, 10));
    } else {
      conditions.push('name LIKE ?');
      values.push(`%${name}%`);
    }
  }

  if (startDate && endDate) {
    conditions.push(`
      id NOT IN (
        SELECT room_id
        FROM order_detail
        WHERE (
          ? >= checkinDate
          AND ? <= checkoutDate
        ) OR (
          ? >= checkinDate
          AND ? <= checkoutDate
        ) OR (
          ? >= checkinDate
          AND ? <= checkoutDate
        )
      )
    `);
    values.push(startDate, endDate, startDate, startDate, endDate, endDate);
  }

  if (numberRooms) {
    conditions.push('numberRooms >= ?');
    values.push(numberRooms);
  }

  if (numberPeople) {
    conditions.push('numberPeople >= ?');
    values.push(numberPeople);
  }

  if (numberChildren) {
    conditions.push('numberChildren >= ?');
    values.push(numberChildren);
  }

  const queryString = `
    SELECT *
    FROM room
    WHERE ${conditions.join(' AND ')}
  `;

  db.query(queryString, values, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    } else {
      res.json({ success: true, data: results });
    }
  });
}

module.exports = Rooms;
