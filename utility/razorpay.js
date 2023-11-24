// Import the Razorpay SDK
const Razorpay = require('razorpay')


require('dotenv').config()


module.exports = {
    createRazorpayOrder: (order) => {
        return new Promise((resolve, reject) => {
            
            const razorpay = new Razorpay({
                key_id: process.env.KEY_ID,
                key_secret: process.env.KEY_SECRET
            });

           
            console.log("INCOMING ORDER IS :", order);

         
            const razorpayOrder = razorpay.orders.create({
                amount: order.amount * 100, 
                currency: 'INR',
                receipt: order.receipt, // Unique identifier for the order
            });

            // Resolve the Promise with the created Razorpay order
            resolve(razorpayOrder);
        });
    }
};
