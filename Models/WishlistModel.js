const mongoose = require('mongoose');

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
  productID: { type: Number, required: true }, // Referencing the product ID
  dateAdded: { type: Date, default: Date.now }
});

// Create Wishlist Model
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
