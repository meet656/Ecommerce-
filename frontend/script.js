const API_BASE = 'http://localhost:5000/api';

const state = {
  products: [],
  filteredProducts: [],
  categories: [],
  cart: { items: [], total: 0, count: 0 },
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || '',
  isSignup: false
};

const els = {
  loadingSpinner: document.getElementById('loadingSpinner'),
  toastContainer: document.getElementById('toastContainer'),
  productGrid: document.getElementById('productGrid'),
  categoryGrid: document.getElementById('categoryGrid'),
  categoryFilter: document.getElementById('categoryFilter'),
  priceFilter: document.getElementById('priceFilter'),
  sortFilter: document.getElementById('sortFilter'),
  clearFilters: document.getElementById('clearFilters'),
  searchInput: document.getElementById('searchInput'),
  cartBadge: document.getElementById('cartBadge'),
  cartList: document.getElementById('cartList'),
  orderSummary: document.getElementById('orderSummary'),
  checkoutForm: document.getElementById('checkoutForm'),
  authButton: document.getElementById('authButton'),
  authForm: document.getElementById('authForm'),
  nameField: document.getElementById('nameField'),
  authTitle: document.getElementById('authTitle'),
  authPrompt: document.getElementById('authPrompt'),
  toggleAuthMode: document.getElementById('toggleAuthMode')
};

const setLoading = (show) => els.loadingSpinner.classList.toggle('hidden', !show);

const toast = (msg) => {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  els.toastContainer.appendChild(t);
  setTimeout(() => t.remove(), 2500);
};

const api = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

const showSection = (id) => {
  document.querySelectorAll('.route-section').forEach((el) => el.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
};

const renderCategories = () => {
  els.categoryGrid.innerHTML = state.categories
    .map((c) => `<button class="category-card glass" data-category="${c}">${c}</button>`)
    .join('');

  els.categoryFilter.innerHTML = `<option value="">All</option>${state.categories
    .map((c) => `<option value="${c}">${c}</option>`)
    .join('')}`;
};

const renderProducts = () => {
  if (!state.filteredProducts.length) {
    els.productGrid.innerHTML = '<p>No products found for selected filters.</p>';
    return;
  }

  els.productGrid.innerHTML = state.filteredProducts
    .map(
      (p) => `
      <article class="product-card glass">
        <img src="${p.image}" alt="${p.title}" />
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="price-row">
          <strong>$${p.price.toFixed(2)}</strong>
          <button class="btn primary" data-add-cart="${p._id}">Add to Cart</button>
        </div>
      </article>
    `
    )
    .join('');
};

const applyFilters = () => {
  const search = els.searchInput.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  const maxPrice = Number(els.priceFilter.value || Infinity);
  const sort = els.sortFilter.value;

  let data = [];
  for (let i = 0; i < state.products.length; i++) {
    const p = state.products[i];
    if (p.title.toLowerCase().includes(search) && (!category || p.category === category) && p.price <= maxPrice) {
      data.push(p);
    }
  }

  if (sort === 'price-asc') data.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') data.sort((a, b) => b.price - a.price);
  if (sort === 'newest') data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  state.filteredProducts = data;
  renderProducts();
};

const renderCart = () => {
  els.cartBadge.textContent = state.cart.count || 0;

  if (!state.cart.items.length) {
    els.cartList.innerHTML = '<p>Your cart is empty.</p>';
    els.orderSummary.innerHTML = '<h3>Order Summary</h3><p>No items yet.</p>';
    return;
  }

  els.cartList.innerHTML = state.cart.items
    .map(
      (item) => `
      <article class="cart-item glass">
        <img src="${item.image}" alt="${item.title}" />
        <div>
          <h3>${item.title}</h3>
          <p>$${item.price.toFixed(2)}</p>
          <div class="qty-control">
            <label>Qty</label>
            <input type="number" min="1" value="${item.quantity}" data-qty-id="${item._id}" />
            <button class="btn ghost" data-remove-id="${item._id}">Remove</button>
          </div>
        </div>
        <strong>$${item.subtotal.toFixed(2)}</strong>
      </article>
    `
    )
    .join('');

  els.cartList.innerHTML += '<button class="btn primary" id="goCheckout">Proceed to Checkout</button>';

  els.orderSummary.innerHTML = `
    <h3>Order Summary</h3>
    <p>Items: ${state.cart.count}</p>
    <p>Total: <strong>$${state.cart.total.toFixed(2)}</strong></p>
  `;
};

const setAuthUI = () => {
  if (state.user) {
    els.authButton.textContent = `Hi, ${state.user.name.split(' ')[0]} (Logout)`;
    els.authButton.dataset.route = 'logout';
  } else {
    els.authButton.textContent = 'Login';
    els.authButton.dataset.route = 'auth';
  }
};

const loadProducts = async () => {
  setLoading(true);
  try {
    const data = await api('/products');
    state.products = data.products;
    state.categories = [...new Set(data.products.map((p) => p.category))];
    state.filteredProducts = [...state.products];
    renderCategories();
    renderProducts();
  } catch (error) {
    toast(error.message);
  } finally {
    setLoading(false);
  }
};

const loadCart = async () => {
  if (!state.token) {
    state.cart = { items: [], total: 0, count: 0 };
    renderCart();
    return;
  }

  try {
    const cartData = await api('/cart');
    state.cart = cartData;
    renderCart();
  } catch (error) {
    toast(error.message);
  }
};

const addToCart = async (productId) => {
  if (!state.token) {
    toast('Please login to add items to cart');
    showSection('authSection');
    return;
  }

  setLoading(true);
  try {
    state.cart = await api('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 })
    });
    renderCart();
    toast('Added to cart');
  } catch (error) {
    toast(error.message);
  } finally {
    setLoading(false);
  }
};

const updateCartQty = async (cartItemId, quantity) => {
  setLoading(true);
  try {
    state.cart = await api('/cart', {
      method: 'PUT',
      body: JSON.stringify({ cartItemId, quantity: Number(quantity) })
    });
    renderCart();
  } catch (error) {
    toast(error.message);
  } finally {
    setLoading(false);
  }
};

const removeCartItem = async (cartItemId) => {
  setLoading(true);
  try {
    state.cart = await api('/cart', {
      method: 'DELETE',
      body: JSON.stringify({ cartItemId })
    });
    renderCart();
    toast('Removed from cart');
  } catch (error) {
    toast(error.message);
  } finally {
    setLoading(false);
  }
};

const handleAuthSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(els.authForm);
  const payload = {
    email: formData.get('email'),
    password: formData.get('password')
  };

  if (state.isSignup) payload.name = formData.get('name');

  setLoading(true);
  try {
    const endpoint = state.isSignup ? '/users/register' : '/users/login';
    const data = await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });

    state.user = data.user;
    state.token = data.token;
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    setAuthUI();
    await loadCart();
    showSection('homeSection');
    toast(data.message);
    els.authForm.reset();
  } catch (error) {
    toast(error.message);
  } finally {
    setLoading(false);
  }
};

const placeOrder = async (e) => {
  e.preventDefault();
  if (!state.cart.items.length) return toast('Cart is empty');

  const formData = new FormData(els.checkoutForm);
  const shippingAddress = `${formData.get('address')}, ${formData.get('city')}`;
  const paymentMethod = formData.get('paymentMethod');

  setLoading(true);
  try {
    await api('/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress, paymentMethod })
    });
    toast('Order placed successfully!');
    els.checkoutForm.reset();
    await loadCart();
    showSection('homeSection');
  } catch (error) {
    toast(error.message);
  } finally {
    setLoading(false);
  }
};

// Global event bindings

document.addEventListener('click', (e) => {
  const route = e.target.dataset.route;
  if (route === 'home') showSection('homeSection');
  if (route === 'cart') {
    showSection('cartSection');
    loadCart();
  }
  if (route === 'auth') showSection('authSection');
  if (route === 'logout') {
    state.user = null;
    state.token = '';
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    state.cart = { items: [], total: 0, count: 0 };
    setAuthUI();
    renderCart();
    toast('Logged out');
    showSection('homeSection');
  }

  const category = e.target.dataset.category;
  if (category) {
    els.categoryFilter.value = category;
    applyFilters();
    document.getElementById('productsArea').scrollIntoView({ behavior: 'smooth' });
  }

  const addCartId = e.target.dataset.addCart;
  if (addCartId) addToCart(addCartId);

  const removeId = e.target.dataset.removeId;
  if (removeId) removeCartItem(removeId);

  if (e.target.id === 'goCheckout') showSection('checkoutSection');

  if (e.target.dataset.scroll) {
    document.getElementById(e.target.dataset.scroll).scrollIntoView({ behavior: 'smooth' });
  }
});

document.addEventListener('change', (e) => {
  if (e.target.dataset.qtyId) {
    updateCartQty(e.target.dataset.qtyId, e.target.value);
  }
});

[els.searchInput, els.categoryFilter, els.priceFilter, els.sortFilter].forEach((el) =>
  el.addEventListener('input', applyFilters)
);
els.sortFilter.addEventListener('change', applyFilters);
els.clearFilters.addEventListener('click', () => {
  els.searchInput.value = '';
  els.categoryFilter.value = '';
  els.priceFilter.value = '';
  els.sortFilter.value = '';
  applyFilters();
});

els.authForm.addEventListener('submit', handleAuthSubmit);
els.checkoutForm.addEventListener('submit', placeOrder);
els.toggleAuthMode.addEventListener('click', () => {
  state.isSignup = !state.isSignup;
  els.authTitle.textContent = state.isSignup ? 'Create Account' : 'Login';
  els.authPrompt.textContent = state.isSignup ? 'Already have an account?' : "Don't have an account?";
  els.toggleAuthMode.textContent = state.isSignup ? 'Login' : 'Sign up';
  els.nameField.classList.toggle('hidden', !state.isSignup);
  els.nameField.required = state.isSignup;
});

// App bootstrap
(async () => {
  setAuthUI();
  showSection('homeSection');
  await loadProducts();
  await loadCart();
})();
