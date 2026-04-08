const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getCart, addToCart, updateCartItem, removeCartItem } = require('../controllers/cartController');

const router = express.Router();

router.get('/', authMiddleware, getCart);
router.post('/', authMiddleware, addToCart);
router.put('/', authMiddleware, updateCartItem);
router.delete('/', authMiddleware, removeCartItem);

module.exports = router;
