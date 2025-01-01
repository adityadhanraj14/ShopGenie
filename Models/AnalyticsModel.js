const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Define the priceHistory schema with dates and prices arrays
const priceHistorySchema = new mongoose.Schema({
  platformName: String,
  dates: [Date],  // Array of dates
  prices: [Number], // Array of prices corresponding to dates
});

// Define the analytics schema
const analyticsSchema = new mongoose.Schema({
  productID: { type: Number, required: true, ref: 'Product' }, // Reference to Product
  priceHistory: [priceHistorySchema], // Array of price history for different platforms
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

const Analytics = mongoose.model('Analytics', analyticsSchema);

// Function to generate random price history for a platform
const generateRandomPriceHistory = (platformName, price, maxprice) => {
  const startDate = new Date('2024-12-01');  // Start date for price history
  const priceHistory = [];
  const dates = [];
  const prices = [];
  
  // Generate 5 price points
  for (let i = 0; i < 5; i++) {
    const randomPrice = Math.floor(Math.random() * (maxprice - price) + price); // Price between price and maxprice
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 5); // Increment by 5 days each time
    dates.push(date);
    prices.push(randomPrice);
  }

  return {
    platformName,
    dates,
    prices,
  };
};

// Function to generate random analytics for each product
const generateAnalyticsForProducts = async (products) => {
  for (const product of products) {
    const priceHistory = product.platforms.map(platform => {
      return generateRandomPriceHistory(platform.name, parseInt(platform.price), parseInt(platform.maxprice));
    });

    const analyticsData = {
      productID: product.productID,
      priceHistory,
    };

    // Check if analytics data already exists for this productID
    const existingAnalytics = await Analytics.findOne({ productID: product.productID });
    
    if (!existingAnalytics) {
      await Analytics.create(analyticsData);
      console.log(`Added analytics for productID: ${product.productID}`);
    } else {
      console.log(`Skipped duplicate analytics for productID: ${product.productID}`);
    }
  }
};

// Main function to generate analytics
async function main() {
  try {
    // Read data from the products.json file
    const jsonData = fs.readFileSync(path.join(__dirname, 'Products.json'), 'utf-8');
    const products = JSON.parse(jsonData); // Parse the JSON data

    // Generate analytics for all products
    await generateAnalyticsForProducts(products);
  } catch (err) {
    console.error('Error generating analytics data:', err);
  }
}

main();

module.exports = Analytics;
