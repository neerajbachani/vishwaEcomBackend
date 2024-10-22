const Address = require("../models/addressmodel");
const OrderItem = require("../models/orderItemsModel");
const Order = require("../models/orderModel");
const cartService = require("../service/cartService")
const shiprocketService = require('../service/shiprocketService');


async function createOrder(user, shippAddress) {
    let address 

    if (shippAddress._id) {
        let existAddress = await Address.findById(shippAddress._id);
        address = existAddress;
    } else {
        address = new Address(shippAddress);
        // address.user = user;                           
        await address.save();
        user.address.push(address);
        await user.save();
    }
    const cart = await cartService.findUserCart(user._id);
const orderItems = [];

for (const item of cart.cartItems) {
    if (!item.product) {
        // Handle the case where product is missing or undefined
        console.error(`Product is missing for item: ${item}`);
        continue; // Skip this item and move to the next one
    }

    const orderItem = new OrderItem({
        price: item.price,
        product: item.product,
        quantity: item.quantity,
        weight: item.weight,
        size: item.size,
        userId: item.userId,
        discount: item.discount,
        discountedPrice: item.discountedPrice,
        customizationImage: item.customizationImage,
        customizationNote: item.customizationNote,
    });

    const createdOrderItem = await orderItem.save();
    orderItems.push(createdOrderItem);
}
const shippingInfo = await calculateDeliveryCharge(address, orderItems);
const createdOrder = new Order({
    user: user,
    orderItems,
    deliveryCharge: shippingInfo.deliveryCharge,
    estimatedDeliveryDays: shippingInfo.estimatedDeliveryDays,
    courierName: shippingInfo.courierName,
    totalPrice: cart.totalPrice,
    totalDiscountedPrice: cart.totalDiscountedPrice + shippingInfo.deliveryCharge,
    discount: cart.discount,
    totalItem: cart.totalItem,
    shippingAddress: address,
    customizationImage: cart.customizationImage,
    customizationNote: cart.customizationNote
    
});

const savedOrder = await createdOrder.save();
console.log("order hai ji",savedOrder);
return savedOrder;
}

async function getAddressById(addressId){
    const address = await Address.findById(addressId).populate("user")
    return address
}

async function calculateDeliveryCharge(address, orderItems) {
    const orderDetails = {
        shippingAddress: address,
        orderItems: orderItems,
        totalDiscountedPrice: orderItems.reduce((total, item) => total + item.discountedPrice * item.quantity, 0)
    };

    const shippingInfo = await shiprocketService.calculateShippingRate(orderDetails);
    console.log("shipping info hai bhai",shippingInfo)
    return shippingInfo;
}

// Modify your placeOrder function to include Shiprocket integration
async function placeOrder(orderId) {
    const order = await findOrderById(orderId);

    order.orderStatus = "PLACED";
    order.paymentDetails.paymentStatus = "COMPLETED";


    return await order.save();
}

// Add new functions for Shiprocket-specific operations
async function trackShipment(orderId) {
    const order = await findOrderById(orderId);
    if (!order.shipmentDetails || !order.shipmentDetails.shipmentId) {
        throw new Error('No shipment found for this order');
    }
    
    return await shiprocketService.trackShipment(order.shipmentDetails.shipmentId);
}

async function generateShippingLabel(orderId) {
    const order = await findOrderById(orderId);
    if (!order.shipmentDetails || !order.shipmentDetails.shipmentId) {
        throw new Error('No shipment found for this order');
    }
    
    return await shiprocketService.generateLabel(order.shipmentDetails.shipmentId);
}

async function generateOrderInvoice(orderId) {
    const order = await findOrderById(orderId);
    if (!order.shipmentDetails || !order.shipmentDetails.shiprocketOrderId) {
        throw new Error('No Shiprocket order found');
    }
    
    return await shiprocketService.generateInvoice(order.shipmentDetails.shiprocketOrderId);
}

async function confirmedOrder(orderId) {
    const order = await findOrderById(orderId);
    order.orderStatus = "CONFIRMED";
    

    return await order.save();
}

async function shipOrder(orderId) {
    const order = await findOrderById(orderId);

    order.orderStatus = "SHIPPED";



    return await order.save();
}

async function deliverOrder(orderId) {
    const order = await findOrderById(orderId);

    order.orderStatus = "DELIVERED";


    return await order.save();
}

async function cancellOrder(orderId) {
    const order = await findOrderById(orderId);

    order.orderStatus = "CANCELLED";

    return await order.save();
}

async function findOrderById(orderId) {

    const order = await Order.findById(orderId)
        .populate("user")
        .populate({ path: "orderItems", populate: { path: "product" } })
        .populate("shippingAddress");

    return order;
}

async function usersOrderHistory(userId) {
    try {
        const orders = await Order.find({ user: userId })
            .populate({ path: "orderItems", populate: { path: "product" } }).lean();
        //   console.log(orders)
        return orders;
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getAllOrders() {
    return await Order.find()
        .populate({ path: "orderItems", populate: { path: "product" } }).lean()
}

async function deleteOrder(orderId) {
    const order = await findOrderById(orderId);
    await Order.findByIdAndDelete(order._id);
}

module.exports = {
    createOrder,
    placeOrder,
    confirmedOrder,
    shipOrder,
    deliverOrder,
    cancellOrder,
    findOrderById,
    usersOrderHistory,
    getAllOrders,
    deleteOrder, 
    getAddressById,
    trackShipment,
    generateShippingLabel,
    generateOrderInvoice,
    calculateDeliveryCharge
}


