const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

const fetchCart = async (userId) => {
  const cartItems = await CartItem.find({ userId }).populate('productId');

  const items = cartItems
    .filter((item) => item.productId)
    .map((item) => ({
      _id: item._id,
      productId: item.productId._id,
      title: item.productId.title,
      price: item.productId.price,
      image: item.productId.image,
      category: item.productId.category,
      quantity: item.quantity,
      subtotal: item.quantity * item.productId.price
    }));

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return { items, total, count: items.reduce((sum, item) => sum + item.quantity, 0) };
};

exports.getCart = async (req, res) => {
  try {
    const cart = await fetchCart(req.user.id);
    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existing = await CartItem.findOne({ userId: req.user.id, productId });
    if (existing) {
      existing.quantity += Number(quantity);
      await existing.save();
    } else {
      await CartItem.create({ userId: req.user.id, productId, quantity: Number(quantity) });
    }

    const cart = await fetchCart(req.user.id);
    return res.status(200).json({ message: 'Item added to cart', ...cart });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add item', error: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;

    if (!cartItemId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'cartItemId and quantity >= 1 are required' });
    }

    const item = await CartItem.findOne({ _id: cartItemId, userId: req.user.id });
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    item.quantity = Number(quantity);
    await item.save();

    const cart = await fetchCart(req.user.id);
    return res.status(200).json({ message: 'Cart updated', ...cart });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update cart', error: error.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.body;

    if (!cartItemId) {
      return res.status(400).json({ message: 'cartItemId is required' });
    }

    const deleted = await CartItem.findOneAndDelete({ _id: cartItemId, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const cart = await fetchCart(req.user.id);
    return res.status(200).json({ message: 'Item removed from cart', ...cart });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to remove item', error: error.message });
  }
};

exports.clearUserCart = async (userId) => {
  await CartItem.deleteMany({ userId });
};

exports.fetchCart = fetchCart;
