const Order = require('../models/Order');
const { fetchCart, clearUserCart } = require('./cartController');

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Shipping address and payment method are required' });
    }

    const cart = await fetchCart(req.user.id);
    if (!cart.items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const order = await Order.create({
      userId: req.user.id,
      items: cart.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: cart.total,
      status: 'placed'
    });

    await clearUserCart(req.user.id);

    return res.status(201).json({
      message: 'Order placed successfully',
      order,
      shippingAddress,
      paymentMethod
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
};
