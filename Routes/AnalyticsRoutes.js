// Routes/AnalyticsRoutes.js
const express = require('express');
const router = express.Router();
const { displayGraph } = require('../Controllers/AnalyticsController');


// Route to display the analytics graph
router.get('/:productID',displayGraph); 
module.exports = router;
