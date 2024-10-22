const express = require('express');
const router = express.Router();
const shiprocketService = require('../service/shiprocketService');
const Order = require('../models/orderModel'); // Adjust the path as needed

router.post('/test-shiprocket-order', async (req, res) => {
  try {
    // Fetch a real order from your database
    const order = await Order.findOne().populate('user').populate('orderItems.product');
    
    if (!order) {
      return res.status(404).json({ message: 'No orders found in the database' });
    }

    const shiprocketResponse = await shiprocketService.createShiprocketOrder(order);

    res.json({
      message: 'Shiprocket order created successfully',
      shiprocketOrderId: shiprocketResponse.order_id,
      shipmentId: shiprocketResponse.shipment_id,
      awbCode: shiprocketResponse.awb_code
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;