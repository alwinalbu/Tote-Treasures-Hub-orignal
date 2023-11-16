// Import the Razorpay SDK
const Razorpay = require('razorpay')

// Import and configure the dotenv package to manage environment variables
require('dotenv').config()

// Export a function createRazorpayOrder that takes an 'order' object as an argument
module.exports = {
    createRazorpayOrder: (order) => {
        return new Promise((resolve, reject) => {
            // Create a new instance of the Razorpay client with your key ID and key secret from environment variables
            const razorpay = new Razorpay({
                key_id: process.env.KEY_ID,
                key_secret: process.env.KEY_SECRET
            });

            // Log the incoming 'order' object to the console
            console.log("INCOMING ORDER IS :", order);

            // Create a new Razorpay order using the 'orders' object's 'create' method
            // This method creates an order with the provided 'amount', 'currency', and 'receipt' properties
            const razorpayOrder = razorpay.orders.create({
                amount: order.amount * 100, // Convert the amount to the smallest currency unit (e.g., paise for INR)
                currency: 'INR', // The currency of the order (in this case, Indian Rupee)
                receipt: order.receipt, // Unique identifier for the order
            });

            // Resolve the Promise with the created Razorpay order
            resolve(razorpayOrder);
        });
    }
};
