const orderService = require("../service/orderService")

const createOrder = async (req, res) => {
    const user = await req.user;
    try {
        let createdOrder = await orderService.createOrder(user, req.body);
        return res.status(201).send(createdOrder);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

const findOrderById = async (req, res) => {
    
    try {
        let createdOrder = await orderService.findOrderById(req.params.id);
        return res.status(201).send(createdOrder);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

const findAddressById = async (req , res) => {
    try {
        let createdAddress = await orderService.getAddressById(req.params.id);
        return res.status(201).send(createdAddress);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

const calculateDeliveryCharge = async (req, res) => {
    try {
        const { address, cartItems } = req.body;
        const shippingInfo = await orderService.calculateDeliveryCharge(address, cartItems);
        res.json(shippingInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const orderHistory = async (req, res) => {
    const user = await req.user;
    try {
        let createdOrder = await orderService.usersOrderHistory(user._id)
        return res.status(201).send(createdOrder);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}
const trackShipment = async (req, res) => {
    try {
        const tracking = await orderService.trackShipment(req.params.id);
        res.status(200).json(tracking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const generateShippingLabel = async (req, res) => {
    try {
        const label = await orderService.generateShippingLabel(req.params.id);
        res.status(200).json(label);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const generateOrderInvoice = async (req, res) => {
    try {
        const invoice = await orderService.generateOrderInvoice(req.params.id);
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createOrder, findOrderById , orderHistory, findAddressById, trackShipment, generateOrderInvoice, generateShippingLabel, calculateDeliveryCharge }
