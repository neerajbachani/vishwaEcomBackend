// shiprocketService.js
const axios = require('axios');
const Order = require('../models/orderModel');
require('dotenv').config();

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';
let authToken = null;
let tokenExpiry = null;

const shiprocketAuth = async () => {
  try {
    // Check if we have a valid token
    if (authToken && tokenExpiry && new Date() < tokenExpiry) {
      return authToken;
    }

    const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    });

    authToken = response.data.token;
    // Set token expiry to 9 days (Shiprocket tokens are valid for 10 days)
    tokenExpiry = new Date(new Date().getTime() + 9 * 24 * 60 * 60 * 1000);
    return authToken;
  } catch (error) {
    console.error('Shiprocket authentication failed:', error);
    throw new Error('Failed to authenticate with Shiprocket');
  }
};

const getOrderWithDetails = async (orderId) => {
    const order = await Order.findById(orderId)
      .populate('user')
      .populate('shippingAddress')
      .populate({
        path: 'orderItems',
        populate: {
          path: 'product',
          model: 'products'
        }
      });
    return order;
  };

  const createShiprocketOrder = async (orderId) => {
    try {
      const order = await getOrderWithDetails(orderId);
    //   console.log("Populated order:", JSON.stringify(order, null, 2));
  
      const token = await shiprocketAuth();
  
      const shiprocketOrderData = {
        order_id: order._id.toString(),
        order_date: new Date().toISOString().split('T')[0],
        pickup_location: "Primary",
        billing_customer_name: `${order.user.firstName} ${order.user.lastName}`,
        billing_last_name: order.user.lastName,
        billing_address: order.shippingAddress.streetAddress,
        billing_city: order.shippingAddress.city,
        billing_pincode: order.shippingAddress.pincode,
        billing_state: order.shippingAddress.state,
        billing_country: order.shippingAddress.country || "India",
        billing_email: order.user.email,
        billing_phone: order.shippingAddress.mobile,
        shipping_is_billing: true,
        order_items: order.orderItems.map(item => ({
          name: item.product.name,
          sku: item.product._id.toString(),
          units: item.quantity,
          selling_price: item.discountedPrice || item.price,
          weight: item.product.weight || 0.5, // Fallback weight if not specified
        })),
        payment_method: 'Prepaid',
        sub_total: order.totalDiscountedPrice,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5,
      };
  
    //   console.log('Sending order to Shiprocket:', JSON.stringify(shiprocketOrderData, null, 2));
  
      const response = await axios.post(
        `${SHIPROCKET_API_URL}/orders/create/adhoc`,
        shiprocketOrderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('Shiprocket response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error creating Shiprocket order:', error);
      if (error.response) {
        console.error('Shiprocket API error response:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error('Failed to create Shiprocket order');
    }
  };

const trackShipment = async (shipmentId) => {
  try {
    const token = await shiprocketAuth();
    const response = await axios.get(
      `${SHIPROCKET_API_URL}/courier/track/shipment/${shipmentId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error tracking shipment:', error);
    throw new Error('Failed to track shipment');
  }
};

const generateLabel = async (shipmentId) => {
  try {
    const token = await shiprocketAuth();
    const response = await axios.post(
      `${SHIPROCKET_API_URL}/courier/generate/label`,
      { shipment_id: [shipmentId] },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating label:', error);
    throw new Error('Failed to generate label');
  }
};

const generateAndSendInvoice = async (orderId) => {
  try {
    const token = await shiprocketAuth();
    const response = await axios.post(
      `${SHIPROCKET_API_URL}/orders/print/invoice`,
      { ids: [orderId] },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    // ShipRocket will automatically send the invoice to the customer's email
    console.log('Invoice generated and sent to customer:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error generating and sending invoice:', error);
    throw new Error('Failed to generate and send invoice');
  }
};

async function calculateShippingRate(orderDetails) {
    console.log("orderdetails hai bhai jji",orderDetails)
    try {
        const token = await shiprocketAuth();

        const params = {
            pickup_postcode: process.env.SHIPROCKET_PICKUP_POSTCODE,
            delivery_postcode: orderDetails.shippingAddress.pincode,
            weight: calculateTotalWeight(orderDetails.orderItems),
            cod: 0, // Since we're only doing prepaid
            declared_value: orderDetails.totalDiscountedPrice
        };
        console.log("params hai ji",params)

        const response = await axios.get(
            `${SHIPROCKET_API_URL}/courier/serviceability`,
            {
                params: params,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
      

        // Find the cheapest available rate
        const availableRates = response.data.data.available_courier_companies;
       
        const cheapestRate = availableRates.reduce((min, company) => 
            company.rate < min.rate ? company : min
        , availableRates[0]);

        return {
            deliveryCharge: cheapestRate.rate,
            estimatedDeliveryDays: cheapestRate.estimated_delivery_days,
            courierName: cheapestRate.courier_name
        };
    } catch (error) {
        console.error('Error calculating shipping rate:', error);
        throw new Error('Failed to calculate shipping rate');
    }
}

function calculateTotalWeight(orderItems) {
    console.log("orderitems hai ji",orderItems)
    return orderItems.reduce((total, item) => total + (item.product.weight || 0.5) * item.quantity, 0);
}

module.exports = {
  createShiprocketOrder,
  trackShipment,
  generateLabel,
  generateAndSendInvoice,
  calculateShippingRate
};