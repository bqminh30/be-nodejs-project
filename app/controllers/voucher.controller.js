const Voucher = require("../models/voucher.model.js");

module.exports = {
  voucherCreate: function (req, res) {
    try {
      if (!req.body) {
        res.status(400).send({
          message: "Content can not be empty!",
        });
      }

      // Create a Voucher
      const voucher = new Voucher({
        name: req.body.name,
        value: req.body.value,
        isShow: true,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      Voucher.create(voucher, (err, data) => {
        if (err)
        
          return res.status(400).json({
            message: "Thiếu dữ liệu yêu cầu",
          });
        else {
          res.status(200).json({data: data, message: "Tạo voucher thành công",});
          
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Some error occurred while creating the Voucher.",});
      
    }
  },

  voucherUpdate: function (req, res) {
    // Validate Request
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!",
      });
    }

    Voucher.update(req.params.id, new Voucher(req.body), (data, err) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).json({
            message: `Not found Facilities with id ${req.params.id}.`,
          });
        } else {
          res.status(500).send({
            message: "Error updating ",
          });
        }
      } else
      res.status(200).send({
          message: "Update voucher success",
          data: data,
        });
    });
  },

  voucherAll: function(req, res) {
    const name = req.query.name;
    try {
      Voucher.getAllPublished(name,(err, data) => {
        if (err)
          res.status(500).send({
            message: err.message || "Some error occurred while retrieving Voucher.",
          });
        else res.status(200).send(data);
      });
    }
      catch (error) {
        res
          .status(500)
          .json({ message: "An error get orders", error: error.message });
      }
     
  }
};
