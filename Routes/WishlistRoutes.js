const express = require('express');
const router = express.Router();
const { displayWishlist, handleWishlist, toggleWishlist, removeFromWishlist } = require('../Controllers/WishlistController');
const { requireAuth } = require('../middleware/authMiddleware');
const Wishlist = require('../Models/WishlistModel'); // Ensure Wishlist model path is correct


// Route to display paginated wishlist items
router.get('/wishlistPage',requireAuth,displayWishlist); // Displays paginated wishlist items

// Route to add a new item to the wishlist
router.post('/add/:productID',requireAuth, handleWishlist);
 

router.post('/toggle', toggleWishlist);

// Route to remove a product from the wishlist
router.post('/remove', removeFromWishlist);

module.exports = router;