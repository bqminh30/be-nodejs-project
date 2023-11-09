const Orders = require("../models/orders.model.js");

exports.booking = async (req, res) => {
  try {
    const requestData = req.body;
    const result = await Orders.createOrderWithDetails(requestData);
    res
      .status(201)
      .json({ message: "Order created successfully", data: result });
  } catch (error) {
    res
      .status(500)
      .json({
        message: error,
      });
  }
};

exports.getOrders = async (req, res) => {
  try {
    Orders.getAll((err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving TypeRooms.",
        });
      else res.status(200).send(data);
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error get orders", error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    Orders.findById(req.params.id, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Orders.",
        });
      else res.status(200).send(data);
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error get orders", error: error.message });
  }
};

exports.getOrderStatusById = async (req, res) => {
  try {
    Orders.getOrderStatus(req.params.id, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Orders.",
        });
      else res.status(200).send(data);
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error get orders", error: error.message });
  }
};

exports.updateOrderStatus = (req, res) => {
  // Assuming you have the 'employee_id' and 'order_id' in the request body or parameters
  const { user, data } = req.body; // You may need to adjust this based on your actual request structure

  const employee_id = user.id;
  const order_id  = data.id

  // Validate that both 'employee_id' and 'order_id' are provided
  if (!employee_id || !order_id) {
    return res.status(400).json({ message: "Both 'employee_id' and 'order_id' are required." });
  }
  

  // Call the 'Orders.updateStatusOrderById' function with the employee and order IDs
  Orders.updateStatusOrderById({ id: order_id,status: data.status, employee_id }, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error updating order status.", error: err.message });
    }

    // Check if the 'result' contains a message indicating unauthorized access
    if (result && result.message === "Unauthorized or Order not found") {
      return res.status(401).json({ message: "Unauthorized to update this order." });
    }

    // Order status updated successfully
    return res.status(200).json({ message: "Order status updated successfully." });
  });
};

exports.totalWidgetData = (req, res) => {
  try {
    Orders.widgetData(req.params.id,(err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Orders.",
        });
      else res.status(200).send(data);
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error get orders", error: error.message });
  }
}

exports.cronJobOrder = (req, res) => {
  console.log('runnnn')
}

