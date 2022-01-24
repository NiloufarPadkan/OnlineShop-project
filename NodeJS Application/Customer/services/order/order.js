const Cart = require("../../../models/Cart");
const CartItem = require("../../../models/CartItem");
const Product = require("../../../models/Product");
const OrderItem = require("../../../models/OrderItem");
const Order = require("../../../models/Order");
const Customer = require("../../../models/Customer");
const Sequelize = require("sequelize");

const Op = Sequelize.Op;

exports.store = async (req, res, next) => {
    try {
        let customerId = req.customer.id;

        let fetchedCart = await Cart.findOne({
            where: {
                customerId: customerId,
            },
            include: {
                model: Product,
                attributes: ["id", "name", "quantity", "base_price", "temp_price"],
            },
        });

        const order = new Order({
            customerId: customerId,
            status: "Pending",
            address: req.body.address,
        });
        let cartItems = fetchedCart.toJSON().products;
        let totalQuantity = 0;
        let totalPrice = 0;
        let outOfStockProducts = [];
        for (let i = 0; i < cartItems.length; i++) {
            if (
                cartItems[i].quantity < 1 ||
                cartItems[i].quantity < cartItems[i].cartItem.quantity
            ) {
                outOfStockProducts.push(cartItems[i]);
                break;
            }
            let newOrderItem = new OrderItem({
                orderId: order.id,
                unit_price: cartItems[i].base_price,
                quantity: cartItems[i].cartItem.quantity,
                productId: cartItems[i].cartItem.productId,
            });
            totalPrice += newOrderItem.quantity * newOrderItem.unit_price;
            totalQuantity += newOrderItem.quantity;
            newOrderItem = await newOrderItem.save();
        }
        if (outOfStockProducts.length >= 1) {
            return "outofstockProducts";
        }
        order.totalPrice = totalPrice;
        order.totalQuantity = totalQuantity;
        await order.save();

        let cartId = fetchedCart.id;

        Cart.destroy({ where: { id: cartId } });

        return order;
    } catch (error) {
        throw new Error(error);
    }
};
exports.AddPaymentId = async (req, res, next) => {
    try {
        let id = req.params.id;
        let paymentId = req.body.paymentId;
        let order = await Order.findOne({
            where: {
                id: id,
            },
            include: [
                {
                    model: Product,
                    attributes: ["id", "name", "quantity", "base_price", "temp_price"],
                },
            ],
        });

        order.paymentId = paymentId;
        order.status = "Processing";

        let orderItems = order.toJSON().products;

        for (let i = 0; i < orderItems.length; i++) {
            const product = await Product.findByPk(orderItems[i].id);
            product.quantity -= orderItems[i].orderItem.quantity;
            await product.save();
        }

        await order.save();
        return order;
    } catch (error) {
        throw new Error(error);
    }
};
exports.cancel = async (req, res, next) => {
    try {
        let id = req.params.id;
        let order = await Order.findOne({
            where: {
                id: id,
                customerId: req.customer.id,
            },
        });
        order.status = "Canceled";
        await order.save();
        return order;
    } catch (error) {
        throw new Error(error);
    }
};
exports.show = async (req, res, next) => {
    try {
        const id = req.params.id;
        let order = await Order.findOne({
            where: {
                id: id,
                customerId: req.customer.id,
            },
            include: [
                {
                    model: Product,
                    attributes: ["id", "name", "quantity", "base_price", "temp_price"],
                },
            ],
        });
        return order;
    } catch (error) {
        throw new Error(error);
    }
};

exports.index = async (req, res, next) => {
    try {
        let order = await Order.findAll({
            where: {
                customerId: req.customer.id,
            },
            include: [
                {
                    model: Product,
                    attributes: ["id", "name", "quantity", "base_price", "temp_price"],
                },
            ],
        });
        return order;
    } catch (error) {
        throw new Error(error);
    }
};
