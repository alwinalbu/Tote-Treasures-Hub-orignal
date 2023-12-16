const Order=require('../models/orderSchema')
const Products=require('../models/productSchema')
const User=require('../models/userSchema')
const pdf=require('../utility/pdf')
const excel=require('../utility/execl')
const Wallet = require('../models/walletSchema')

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
      
          if (status.toLowerCase() === "delivered") {
            updatedOrder.PaymentStatus = "Paid";
          } else if (status.toLowerCase() === "rejected") {
            updatedOrder.PaymentStatus = "Order Rejected";
      
           
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
      
          res.json(updatedOrder); 
        } catch (error) {
          console.error("Error updating order status:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      },


// --------------------------------------------Cancel the Return Request----------------------------------------------------------------

cancelReturn: async (req,res)=>{

  try {

    const orderId=req.params.orderId;

    console.log("inside the cancel return id ",orderId)

    const updatedOrder=await Order.findByIdAndUpdate(
      { _id: orderId },
      { $set: { Status: "Return Canceled"} }, 
      { new: true }
    )
    res.json({ success: true, order: updatedOrder });

  } catch (error) {
    console.error('Error:',error);
    res.status(500).json({success:false,error:'Internal Server Error'})
    
  }
},
      


// -------------------------------------------------Accept The Return Request----------------------------------------------------------------

acceptReturn: async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.session.user.user;

    console.log("User id is :",userId);
    console.log("REached inside the return ACCEPTANCE order id:",orderId);

    const updatedOrder = await Order.findByIdAndUpdate(
      { _id: orderId },
      { $set: { Status: 'Return Accepted' } },
      { new: true }
    );
    
    const TotalPrice=updatedOrder.TotalPrice

    console.log("User Return TOTAL PRICE is :",TotalPrice);

    const wallet=await Wallet.findOneAndUpdate({UserID:userId},{$inc:{Amount:TotalPrice}})

    updatedOrder.PaymentStatus = "Refund To Wallet";

    for (const item of updatedOrder.Items) {
      const product = await Products.findById(item.ProductId).exec(); 
      product.AvailableQuantity += item.Quantity;
      await product.save();

      console.log("quantity got updated", product.AvailableQuantity);
    }

    await updatedOrder.save();

    res.json({ success: true, message: 'Return accepted successfully', order: updatedOrder });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
},


// --------------------------------Download sales report------------------------------------------------------------------

getDownloadSalesReport: async (req, res) => {
  console.log("reached inside of download sales report");

  try {
    const startDate = new Date(req.body.startDate);
    const format = req.body.fileFormat;
    const endDate = new Date(req.body.endDate);

    const orders = await Order.find({
      Status: {
        $nin: ["Return Pending", "Cancelled", "Return Accepted"]
      },
      OrderDate: { $gte: startDate, $lte: endDate },
      PaymentStatus: { $in: ["Paid", "Pending"] }, // Corrected field name
    })
    .populate('Items.ProductId')
    .populate('UserId');

    const totalSales = await Order.aggregate([
      {
        $match: {
          PaymentStatus: { $in: ["Paid", "Pending"] }, // Corrected field name
          OrderDate: { $gte: startDate, $lte: endDate },
          Status: { $nin: ["Return Pending", "Cancelled", "Return Accepted"] },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$TotalPrice' },
        },
      },
    ]);

    console.log("total sales is ", totalSales);

    const sum = totalSales.length > 0 ? totalSales[0].totalSales : 0;

    if (format === 'pdf') {
      pdf.downloadPdf(req, res, orders, startDate, endDate, totalSales);
    } else if (format === 'excel') {
      excel.downloadExcel(req, res, orders, startDate, endDate, totalSales);
    } else {
      res.status(400).json({ error: 'Unsupported file format' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
},



}
