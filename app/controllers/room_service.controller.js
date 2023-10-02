const RoomService = require("../models/room_service.model.js");

module.exports = {
  roomserviceCreate: function (req, res) {
    try {
      if (!req.body) {
        res.status(400).send({
          message: "Content can not be empty!",
        });
      }

      // Create a RoomService
      const roomservice = new RoomService({
        quantity: req.body.quantity,
        room_id: req.body.room_id,
        service_id: req.body.service_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      RoomService.create(roomservice, (err, data) => {
        if (err)
          return res.send({
            status: 400,
            message: "Thiếu dữ liệu yêu cầu",
          });
        else {
          res.send({
            status: 200,
            data: data,
            message: "Tạo voucher thành công",
          });
        }
      });
    } catch (error) {
      res.send({
        status: 500,
        message: `Có lỗi xảy ra ${error}`,
      });
    }
  },

//   voucherUpdate: function (req, res) {
//     // Validate Request
//     if (!req.body) {
//       res.status(400).send({
//         message: "Content can not be empty!",
//       });
//     }

//     Voucher.update(req.params.id, new Voucher(req.body), (data, err) => {
//       if (err) {
//         if (err.kind === "not_found") {
//           res.status(404).json({
//             message: `Not found Facilities with id ${req.params.id}.`,
//           });
//         } else {
//           res.status(500).send({
//             message: "Error updating ",
//           });
//         }
//       } else
//         res.send({
//           status: 200,
//           message: "Update voucher success",
//           data: data,
//         });
//     });
//   },
};
