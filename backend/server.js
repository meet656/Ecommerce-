const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const Product = require('./models/Product');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ message: 'API running' });
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong' });
});

const seedProducts = async () => {
  const productCount = await Product.countDocuments();
  if (productCount > 0) return;

  await Product.insertMany([
    {
      title: 'Air Pro Wireless Headphones',
      price: 129.99,
      description: 'Premium noise-cancelling headphones with 40-hour battery life.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      category: 'Audio'
    },
    {
      title: 'SmartFit Sports Watch',
      price: 199.0,
      description: 'Track your health, workouts, and notifications in style.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      category: 'Wearables'
    },
    {
      title: 'Ultra HD Action Camera',
      price: 249.5,
      description: 'Capture adventures with crisp 4K video and waterproof housing.',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      category: 'Cameras'
    },
    {
      title: 'Ergo Mechanical Keyboard',
      price: 89.99,
      description: 'Tactile typing experience with RGB lighting and ergonomic layout.',
      image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80',
      category: 'Accessories'
    },
    {
      title: 'Minimalist Desk Lamp',
      price: 54.95,
      description: 'Modern LED desk lamp with adjustable brightness and touch controls.',
      image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80',
      category: 'Home'
    },
    {
      title: 'Portable Bluetooth Speaker',
      price: 74.0,
      description: 'Big immersive sound in a compact, travel-friendly design.',
      image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=800&q=80',
      category: 'Audio'
    }
  ]);

  console.log('✅ Seed products inserted');
};

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  await seedProducts();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
