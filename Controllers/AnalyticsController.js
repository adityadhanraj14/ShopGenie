// Controllers/AnalyticsController.js
const Analytics = require('../Models/AnalyticsModel');

async function displayGraph (req, res){
  try {
    const productID = req.params.productID;
    const analyticsData = await Analytics.findOne({ productID });

    if (analyticsData) {
      // Set Content-Type to application/json
      res.setHeader('Content-Type', 'application/json');
      
      // Send the data as JSON
      res.json(analyticsData);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error('Error fetching analytics data:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { displayGraph };