const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    
  },
  
  orderItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'orderItems',
  }],
  orderDate: {
    type: Date,
    required: true,
    default:Date.now()
  },
  deliveryDate: {
    type: Date,
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'addresses',
  },
  paymentDetails: {

    paymentMethod: {
      type: String,
      
    },
    transactionId: {
      type: String,
      
    },
    paymentId: {
      type: String,
      
    },
    paymentStatus: {
      type: String,
      default: "PENDING"
    },
  },

  note:{
    type: String,
  },
  
  totalPrice:{
    type: Number,
    required: true,
  },
  totalDiscountedPrice: {
    type: Number,
    required: true,
  },
  deliveryCharge: {
    type: Number,
    required: true,
  },
  estimatedDeliveryDays: {
    type: Number,
    required: true,
  },
  courierName: {
    type: String,
    required: true,
  },

  discount: {
    type: Number,
    // required: true,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "PENDING"
  },
  totalItem: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  shipmentDetails: {
    shipmentId: String,
    shiprocketOrderId: String,
    awbCode: String,
    courierName: String,
    trackingUrl: String,
    labelUrl: String,
    invoiceUrl: String
}

});

const Order = mongoose.model('orders', orderSchema);
module.exports = Order
