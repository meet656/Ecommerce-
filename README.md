# LumaCart - Premium eCommerce

A production-ready eCommerce application featuring a premium modern UI, a secure backend, and a robust feature set.

## Features
- Complete user authentication (Login/Signup)
- Product browsing with categories, filtering, and sorting
- Shopping cart management
- Checkout and order management
- Responsive, modern user interface

## Tech Stack
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT), bcrypt

## Project Structure
- `/frontend`: Contains all the client-side code (HTML, CSS, JS)
- `/backend`: Contains the server-side code (Node.js, Express)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ecommerceDB
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The server will start on http://localhost:5000. It will automatically seed the database with initial products on first run.*

### Frontend Setup
1. Open the `/frontend/index.html` file in your preferred web browser. Alternatively, serve it using a local static file server like `live-server` or `serve`:
   ```bash
   # If you have 'serve' installed globally
   serve frontend
   ```
2. The frontend is configured to communicate with the backend running on `http://localhost:5000`.

## API Endpoints
- `GET /api/health` - Check API health
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Authenticate user
- `GET /api/products` - Get all products
- `GET /api/cart` - Get user cart
- `POST /api/orders` - Place an order
