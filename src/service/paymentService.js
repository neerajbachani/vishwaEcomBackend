
const { razorpay } = require("../config/razorpayClient.js");
const orderService = require("../service/orderService.js")
const shiprocketService = require("../service/shiprocketService.js")
const mailer = require("../controller/mailer.js")
const ENV = require("../config/mail.js")



const createPaymentLink= async (orderId)=>{
    // const { amount, currency, receipt, notes } = reqData;
    try {
        
        const order = await orderService.findOrderById(orderId);
        const amountInPaise = Math.round(order.totalDiscountedPrice * 100);
    
        const paymentLinkRequest = {
          amount: amountInPaise,
          currency: 'INR',
          customer: {
            name: order.user.firstName + ' ' + order.user.lastName,
            contact: order.user.mobile,
            email: order.user.email,
          },
          notify: {
            sms: true,
            email: true,
          },
          reminder_enable: true,
          callback_url: `https://resingiftstore.com/payment/${orderId}`,
          callback_method: 'get',
        };
    
        const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);
    
        const paymentLinkId = paymentLink.id;
        const payment_link_url = paymentLink.short_url;
    
     
    
        // Return the payment link URL and ID in the response
        const resData = {
          paymentLinkId: paymentLinkId,
          payment_link_url,
        };
        return resData;
      } catch (error) {
        console.error('Error creating payment link:', error);
        throw new Error(error.message);
      }
}

const updatePaymentInformation = async (reqData) => {
  const paymentId = reqData.payment_id;
  const orderId = reqData.order_id;
  try {
    let order = await orderService.findOrderById(orderId);
    const payment = await razorpay.payments.fetch(paymentId);
     
    if (payment.status === 'captured') {
      order.paymentDetails.paymentId = paymentId;
      order.paymentDetails.paymentStatus = 'COMPLETED';
      order.orderStatus = 'PLACED';
         
      // Create Shiprocket order
      const shiprocketResponse = await shiprocketService.createShiprocketOrder(order);
      order.shipmentDetails = {
        shipmentId: shiprocketResponse.shipment_id,
        shiprocketOrderId: shiprocketResponse.order_id,
        awbCode: shiprocketResponse.awb_code,
        courierName: shiprocketResponse.courier_name
      };
         
      await order.save();

      // Generate invoice through ShipRocket
      const invoiceResponse = await shiprocketService.generateAndSendInvoice(shiprocketResponse.order_id);
      
      // Send email notification to customer
      await mailer.sendMail({
        to: order.user.email,
        subject: "Order Confirmation and Invoice",
        text: `Your order ${order._id} has been confirmed and paid. You can download your invoice from this link: ${invoiceResponse.invoice_url}`
      });

      // Send email notification to admin
      await mailer.sendMail({
        to: ENV.ADMIN_EMAIL, // Make sure ADMIN_EMAIL is defined in your .env file
        subject: "New Order Paid",
        text: `A new order ${order._id} has been paid by ${order.user.firstName} ${order.user.lastName}. Invoice: ${invoiceResponse.invoice_url}`
      });
    }
     
    return { message: 'Your order is placed', success: true };
  } catch (error) {
    console.error('Error processing payment or creating Shiprocket order:', error);
    throw new Error(error.message);
  }
}




module.exports={createPaymentLink,updatePaymentInformation}