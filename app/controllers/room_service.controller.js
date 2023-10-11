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
          return res.status(400).send({
            message: "Thiếu dữ liệu yêu cầu",
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
      console.log('requestData', requestData)
      const promises = []
      if(requestData?.length <= 0){
        res.status(500).send({
          message: "Không có dữ liệu ",
          status: 500,
        });
      }
      
      else {
        requestData.forEach( async (item) => {
          console.log('item',item)
          return new Promise((resolve, reject) => {
            const inputValues = {
              quantity: 1,
              room_id: idRoom,
              service_id: item,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            const promise = RoomService.create(inputValues, function (err, data) {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            });

            promises.push(promise);
          })
        })

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
  }
  

};
