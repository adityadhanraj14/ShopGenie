// api/app.js

require('dotenv').config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose"); // Use mongoose directly
const productRoute = require("../Routes/ProductRoutes");
const wishlistRoute = require("../Routes/WishlistRoutes");
const categoryRoutes = require("../Routes/CategoryRoutes");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const authRoutes = require('../Routes/authRoutes');
const { checkUser } = require("../middleware/authMiddleware");
const analyticsRoute = require("../Routes/AnalyticsRoutes");

const app = express();

// Database Connection
let isConnected = false;
const connectToMongoDB = async () => {
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Set View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, '..', 'Views'));

// Routes for authentication 
app.get('*', checkUser);
app.use('/auth', authRoutes);

// Routes
app.use("/products", productRoute); // Product-related routes
app.use("/wishlist", wishlistRoute); // Wishlist-related routes
app.use("/index", categoryRoutes);
app.use("/analytics", analyticsRoute);

// Route for indexPage
app.get('/', async (req, res) => {
    await connectToMongoDB();
    res.render('indexPage', { errorMessage: null });
});

// Connect to DB for all requests and then export app
// This is the Vercel-compatible way to handle the DB connection
app.use(async (req, res, next) => {
    await connectToMongoDB();
    next();
});

// Export the Express app for Vercel
module.exports = app;