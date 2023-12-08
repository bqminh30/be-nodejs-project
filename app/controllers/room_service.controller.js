const RoomService = require("../models/room_service.model.js");

module.exports = {
  roomserviceCreate: function (req, res) {
    console.log("res", req.body);
    try {
      // if (!req.body) {
      //   res.status(400).send({
      //     message: "Content can not be empty!",
      //   });
      // }

      // Create a RoomService
      const roomservice = new RoomService({
        quantity: req.body.quantity,
        room_id: req.body.room_id,
        customer_id: req.body.customer_id,
        service_id: req.body.service_id,
        order_id: req.body.order_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      RoomService.create(roomservice, (err, data) => {
        if (err)
          return res.status(400).send({
            message: err,
          });
        else {
          res.status(200).send({
            data: data,
            message: "Tạo voucher thành công",
          });
        }
      });
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: `Có lỗi xảy ra ${error}`,
      });
    }
  },

  roomServiceMulCreate: async function (req, res) {
    try {
      if (!req.body) {
        return res.status(400).send({
          message: "Content can not be empty!",
        });
      }
      const idRoom = req.params.id;
      const requestData = req.body; // Đổi tên biến data thành requestData
      const promises = [];
      if (requestData?.length <= 0) {
        res.status(500).send({
          message: "Không có dữ liệu ",
          status: 500,
        });
      } else {
        requestData.forEach(async (item) => {
          console.log("item", item);
          return new Promise((resolve, reject) => {
            const inputValues = {
              quantity: 1,
              room_id: idRoom,
              service_id: item,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            const promise = RoomService.create(
              inputValues,
              function (err, data) {
                if (err) {
                  reject(err);
                } else {
                  resolve(data);
                }
              }
            );

            promises.push(promise);
          });
        });

        try {
          const createdServices = await Promise.all(promises);
          res.status(200).send({
            message: "Cập nhật dịch vụ phòng thành công",
            status: 200,
          });
        } catch (error) {
          res.status(500).send({
            message: "Cập nhật dịch vụ phòng thất bại",
            status: 500,
            data: error,
          });
        }
      }
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: `Có lỗi xảy ra ${error}`,
      });
    }
  },

  roomServiceUpdate: async function (req, res) {
    try {
      if (!req.body) {
        return res.status(400).send({
          message: "Content can not be empty!",
        });
      }
      const requestData = req.body;
      const idRoom = req.params.id;
      const promises = [];
      if (requestData?.length <= 0) {
        res.status(500).send({
          message: "Không có dữ liệu ",
          status: 500,
        });
      } else {
        RoomService.deleteServiceByRoomId(idRoom, (err, data) => {
          console.log("log", err, data);
        });

        requestData.forEach(async (item) => {
          return new Promise((resolve, reject) => {
            const inputValues = {
              quantity: 1,
              room_id: idRoom,
              service_id: item,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            const promise = RoomService.create(
              inputValues,
              function (err, data) {
                if (err) {
                  reject(err);
                } else {
                  resolve(data);
                }
              }
            );

            promises.push(promise);
          });
        });

        try {
          const createdServices = await Promise.all(promises);
          res.status(200).send({
            message: "Cập nhật dịch vụ phòng thành công",
            status: 200,
          });
        } catch (error) {
          res.status(500).send({
            message: "Cập nhật dịch vụ phòng thất bại",
            status: 500,
            data: error,
          });
        }
      }
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: `Có lỗi xảy ra ${error}`,
      });
    }
  },

  findAll: async function (req, res) {
    // const name = req.query.name;

    RoomService.getAll((err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving TypeRooms.",
        });
      else res.status(200).send(data);
    });
  },
  findDetail: async function (req, res) {
    const id = req.params.id;

    RoomService.getDetail(id, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving TypeRooms.",
        });
      else res.status(200).send(data);
    });
  },

  updateServiceStatus: async function (req, res) {
    const { user, data } = req.body; // You may need to adjust this based on your actual request structure

    // console.log('re', req.body)
    const employee_id = user.id;
    const id = data.id;
    // Call the 'Orders.updateStatusOrderById' function with the employee and order IDs
    RoomService.updateStatusOrderById(
      { id: id, active: data.active, employee_id, order_id: data.order_id },
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({
              message: "Error updating order status.",
              error: err.message,
            });
        }

        // Check if the 'result' contains a message indicating unauthorized access
        if (result && result.message === "Unauthorized or Order not found") {
          return res
            .status(401)
            .json({ message: "Unauthorized to update this order." });
        }

        // Order status updated successfully
        return res
          .status(200)
          .json({ message: "Order status updated successfully." });
      }
    );
  },
};
