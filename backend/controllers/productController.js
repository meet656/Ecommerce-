const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const { search = '', category = '', sort = '' } = req.query;

    const filter = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    const sortOptions = {};
    if (sort === 'price-asc') sortOptions.price = 1;
    if (sort === 'price-desc') sortOptions.price = -1;
    if (sort === 'newest') sortOptions.createdAt = -1;

    const products = await Product.find(filter).sort(sortOptions);

    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ product });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};
