const Order=require('../models/orderSchema')
const Products=require('../models/productSchema')
const User=require('../models/userSchema')

module.exports={

  getOrders: async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Accessing page from query parameters
        const perPage = 5;
        const skip = (page - 1) * perPage;
        const orders = await Order.find().skip(skip).limit(perPage).populate('UserId', 'Email').exec();

        const totalCount = await Order.countDocuments();

        res.render("admin/orderlist", {
            orders,
            currentPage: page,
            perPage,
            totalCount,
            totalPages: Math.ceil(totalCount / perPage),
        });
    } catch (err) {
        res.status(500).send('Error fetching orders');
    }
},


    getOrderDetails: async (req, res) => {
        try {

        console.log("admin order details inside ")

          const orderId = req.params._id;
          const orderDetails = await Order.findOne({ _id: orderId }).populate(
            "Items.ProductId"
          );
          res.render("admin/orderDetailspage", { order: orderDetails });
        } catch (error) {
          console.log(error);
        }
      },



      changeStatus: async (req, res) => {
        console.log("Updating order status...");
      
        const orderId = req.params.orderId;
        const { status } = req.body;
      
        try {
          const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { Status: status },
            { new: true }
          );
      
          // Update PaymentStatus based on the status
          if (status.toLowerCase() === "delivered") {
            updatedOrder.PaymentStatus = "Paid";
          } else if (status.toLowerCase() === "rejected") {
            updatedOrder.PaymentStatus = "Order Rejected";
      
            // If the order is rejected, update product quantities back to the database
            for (const item of updatedOrder.Items) {
              const product = await Products.findById(item.ProductId);
              product.AvailableQuantity += item.Quantity;
              await product.save();

              console.log("quantity got updated",product.AvailableQuantity)
            }
          } else {
            updatedOrder.PaymentStatus = "Pending";
          }
      
          await updatedOrder.save();
      
          res.json(updatedOrder); // Respond with the updated order
        } catch (error) {
          console.error("Error updating order status:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      },
      
}
