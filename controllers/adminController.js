const User = require("../models/userSchema");
const flash = require("express-flash");
const Admin = require("../models/adminSchema")
const Brand=require("../models/brandSchema")
const Order=require('../models/orderSchema')
const Products=require('../models/productSchema')
const Category = require('../models/categorySchema')
const moment = require("moment");


const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
    // admin: async () => {
    //     try {
    //         const Name = "Alwin Denny"; // Set the admin's name
    //         const Email = "alwin.009@gmail.com";
    //         const Password = "alwin1234";
    //         const hashedPassword = await bcrypt.hash(Password, 10);
    //         const adminData = await Admin.create({ Name: Name, Email: Email, Password: hashedPassword });
    //         console.log("Admin is created");
    //         console.log(adminData);
    //         return adminData;
    //     } catch (error) {
    //         console.error("Error creating admin:", error);
    //         throw error;
    //     }
    // },

    initial: (req, res) => {
        res.redirect("/admin/login");
      },

      getLogin: async (req, res) => {
        try {
            res.render("admin/adminLogin", { admin: req.session.admin });
        } catch (error) {
            console.log(error);
        }
    },
    
    postLogin: async (req, res) => {
        try {
            const Email = req.body.Email;
            console.log(req.body.Email);
            const Password = req.body.Password;
            const admin = await Admin.findOne({ Email: Email });
            console.log(admin);
    
            if (admin.Status === "Active") {
                const matchedPassword = await bcrypt.compare(Password, admin.Password);
                if (matchedPassword) {
                    const accessToken = jwt.sign(
                        { admin: admin._id },
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: 60 * 60 }
                    );
    
                    // Set both the admin's name and ID in the session
                    req.session.admin = {
                        _id: admin._id,
                        Name: admin.Name // Include the Name here
                    };
    
                    res.cookie("adminJwt", accessToken, { maxAge: 60 * 1000 * 60 });
                    res.redirect("/admin/dashboard");
                } else {
                    console.log("Password not matched");
                    res.redirect("/admin/login");
                }
            } else {
                console.log("Admin not active");
                res.redirect("/admin/login");
            }
        } catch (error) {
            console.log(error);
            res.redirect("/admin/login");
        }
    },

    getDashboard: async (req, res) => {
      const adminName = req.session.admin.Name;
  
      try {
          // Fetch latest orders with populated UserId and Items
          const latestOrders = await Order.find()
              .sort({ OrderDate: -1 })
              .limit(5)
              .populate({
                  path: 'UserId',
                  select: 'Username Email',
              })
              .populate({
                  path: 'Items.ProductId',
                  model: 'Products',
                  select: 'ProductName',
              });
  
          // Fetch frequent users (those with the most orders)
          const frequentUsers = await User.aggregate([
              {
                  $lookup: {
                      from: 'orders',
                      localField: '_id',
                      foreignField: 'UserId',
                      as: 'userOrders',
                  },
              },
              {
                  $addFields: {
                      orderCount: { $size: '$userOrders' },
                  },
              },
              {
                  $sort: { orderCount: -1 },
              },
              {
                  $limit: 5,
              },
          ]);
  
          res.render('admin/dashboard', { adminName, latestOrders, frequentUsers });
      } catch (error) {
          console.error('Error fetching data:', error);
          res.status(500).send('Internal Server Error');
      }
  },
  
//   -------------------------------------chart day month and year-------------------------------------------------

getCount: async (req, res) => {
    try {
      const orders = await Order.find({
        Status: {
          $nin:["returned","Cancelled","Rejected"]
        }
      });
      const orderCountsByDay = {};
      const totalAmountByDay = {};
      const orderCountsByMonthYear = {};
      const totalAmountByMonthYear = {};
      const orderCountsByYear = {};
      const totalAmountByYear = {};
      let labelsByCount;
      let labelsByAmount;
      let dataByCount;
      let dataByAmount;
      console.log('outside')
      orders.forEach((order) => {
        console.log(order,'inside')
        const orderDate = moment(order.OrderDate, "ddd, MMM D, YYYY h:mm A");
        const dayMonthYear = orderDate.format("YYYY-MM-DD");
        const monthYear = orderDate.format("YYYY-MM");
        const year = orderDate.format("YYYY");
        console.log("order date is :",orderDate);
        
        if (req.url === "/count-orders-by-day") {
          console.log("count");
          if (!orderCountsByDay[dayMonthYear]) {
            orderCountsByDay[dayMonthYear] = 1;
            totalAmountByDay[dayMonthYear] = order.TotalPrice
          } else {
            orderCountsByDay[dayMonthYear]++;
            totalAmountByDay[dayMonthYear] += order.TotalPrice
          }
          const ordersByDay = Object.keys(orderCountsByDay).map(
            (dayMonthYear) => ({
              _id: dayMonthYear,
              count: orderCountsByDay[dayMonthYear],
            })
          );
          const amountsByDay = Object.keys(totalAmountByDay).map(
            (dayMonthYear) => ({
              _id: dayMonthYear,
              total: totalAmountByDay[dayMonthYear],
            })
          );
          amountsByDay.sort((a,b)=> (a._id < b._id ? -1 : 1));
          ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));
          labelsByCount = ordersByDay.map((entry) =>
            moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
          );
          labelsByAmount = amountsByDay.map((entry) =>
            moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
          );
          dataByCount = ordersByDay.map((entry) => entry.count);
          dataByAmount = amountsByDay.map((entry) => entry.total);


        } else if (req.url === "/count-orders-by-month") {
          if (!orderCountsByMonthYear[monthYear]) {
            orderCountsByMonthYear[monthYear] = 1;
            totalAmountByMonthYear[monthYear] = order.TotalPrice;
          } else {
            orderCountsByMonthYear[monthYear]++;
            totalAmountByMonthYear[monthYear] += order.TotalPrice;
          }
        
          const ordersByMonth = Object.keys(orderCountsByMonthYear).map(
            (monthYear) => ({
              _id: monthYear,
              count: orderCountsByMonthYear[monthYear],
            })
          );
          const amountsByMonth = Object.keys(totalAmountByMonthYear).map(
            (monthYear) => ({
              _id: monthYear,
              total: totalAmountByMonthYear[monthYear],
            })
          );
          console.log("by monthhh",amountsByMonth);
        
          ordersByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
          amountsByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
        
          labelsByCount = ordersByMonth.map((entry) =>
            moment(entry._id, "YYYY-MM").format("MMM YYYY")
          );
          labelsByAmount = amountsByMonth.map((entry) =>
            moment(entry._id, "YYYY-MM").format("MMM YYYY")
          );
          dataByCount = ordersByMonth.map((entry) => entry.count);
          dataByAmount = amountsByMonth.map((entry) => entry.total);
        } else if (req.url === "/count-orders-by-year") {
          // Count orders by year
          if (!orderCountsByYear[year]) {
            orderCountsByYear[year] = 1;
            totalAmountByYear[year] = order.TotalPrice;
          } else {
            orderCountsByYear[year]++;
            totalAmountByYear[year] += order.TotalPrice;
          }
        
          const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
            _id: year,
            count: orderCountsByYear[year],
          }));
          const amountsByYear = Object.keys(totalAmountByYear).map((year) => ({
            _id: year,
            total: totalAmountByYear[year],
          }));
        
          ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
          amountsByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
        
          labelsByCount = ordersByYear.map((entry) => entry._id);
          labelsByAmount = amountsByYear.map((entry) => entry._id);
          dataByCount = ordersByYear.map((entry) => entry.count);
          dataByAmount = amountsByYear.map((entry) => entry.total);
        }
      });


      res.json({ labelsByCount,labelsByAmount, dataByCount, dataByAmount });
    } catch (err) {
      console.error(err);
    }
  },


    getUser: async (req, res) => {
        try {
           const page = parseInt(req.query.page) || 1; // Accessing page from query parameters
           const perPage = 5;
           const skip = (page - 1) * perPage;
           const adminName = req.session.admin.Name;
           const users = await User.find({}).skip(skip).limit(perPage).sort({ Username: 1 });

          const totalCount = await User.countDocuments();

          // console.log("users are :",users)
          res.render("admin/manageUsers", {
            users,
            adminName,
            currentPage: page,
            perPage,
            totalCount,
            totalPages: Math.ceil(totalCount / perPage),
          });
        } catch (error) {
          res.send(error);
        }
      },

      blockUser: async (req, res) => {
        try {
          // Extract the _id parameter from the request's URL
          const _id = req.params._id;
          
          // Find a user in the database based on the extracted _id
          const userData = await User.findOne({ _id: _id });
          
          // Log the user data to the console
          console.log(userData);
      
          // Check if the user's status is "Active"
          if (userData.Status === "Active") {
            // If the user is active, update their status to "Blocked"
            const user = await User.findByIdAndUpdate(_id, { Status: "Blocked" });
            const alertMessage = "This user is being blocked";
            
            // Set an alert message in the session for later use
            req.session.alert = alertMessage;
            
            // Redirect the user to the "/admin/userslist" page
            res.redirect("/admin/userslist");
          } else if (userData.Status === "Blocked") {
            // If the user is blocked, update their status to "Active"
            const user = await User.findByIdAndUpdate(_id, { Status: "Active" });
            const alertMessage = "This user is being unblocked";
            
            // Set an alert message in the session for later use
            req.session.alert = alertMessage;
            
            // Redirect the user to the "/admin/userslist" page
            res.redirect("/admin/userslist");
          }
        } catch (error) {
          // In case of an error, set a generic alert message
          const alertMessage = "This is an alert message.";
          req.session.alert = alertMessage;
          
          // Redirect the user to the "/admin/userslist" page
          res.redirect("/admin/userslist");
        }
      },

// ----------------------------------------------------------Dashboard things--------------------------------------

getBestSellingProducts: async (req, res) => {
  try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const bestSellingProducts = await Order.aggregate([
          {
              $match: {
                  OrderDate: { $gte: today },
              },
          },
          {
              $unwind: '$Items',
          },
          {
              $group: {
                  _id: '$Items.ProductId',
                  totalSold: { $sum: '$Items.Quantity' },
              },
          },
          {
              $sort: { totalSold: -1 },
          },
          {
              $limit: 5, // Adjust the limit based on the number of top products you want to retrieve
          },
          {
              $lookup: {
                  from: 'products',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'productDetails',
              },
          },
          {
              $unwind: '$productDetails',
          },
          {
              $project: {
                  _id: '$productDetails._id',
                  ProductName: '$productDetails.ProductName',
                  Price: '$productDetails.DiscountAmount',
                  Status: '$productDetails.Status',
                  images: '$productDetails.images',
                  TotalSold: '$totalSold',
              },
          },
      ]);

      res.json({ bestSellingProducts });

  } catch (error) {
      console.error('Error fetching best-selling product data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
},

// ------------------------------------------Monthly products-----------------------------------------------------

getMonthlyBestSellingProducts: async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate the first day of the current month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthlyBestSellingProducts = await Order.aggregate([
      {
        $match: {
          OrderDate: { $gte: firstDayOfMonth, $lt: today },
        },
      },
      {
        $unwind: '$Items',
      },
      {
        $group: {
          _id: '$Items.ProductId',
          totalSold: { $sum: '$Items.Quantity' },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: '$productDetails',
      },
      {
        $project: {
          _id: '$productDetails._id',
          ProductName: '$productDetails.ProductName',
          Price: '$productDetails.DiscountAmount',
          Status: '$productDetails.Status',
          images: '$productDetails.images',
          TotalSold: '$totalSold',
        },
      },
    ]);

    res.json({ monthlyBestSellingProducts });
  } catch (error) {
    console.error('Error fetching monthly best-selling product data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
},

// ----------------------------------------------Yearly Products------------------------------------------------

getYearlyBestSellingProducts: async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate the first day of the current year
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    const yearlyBestSellingProducts = await Order.aggregate([
      {
        $match: {
          OrderDate: { $gte: firstDayOfYear, $lt: today },
        },
      },
      {
        $unwind: '$Items',
      },
      {
        $group: {
          _id: '$Items.ProductId',
          totalSold: { $sum: '$Items.Quantity' },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: '$productDetails',
      },
      {
        $project: {
          _id: '$productDetails._id',
          ProductName: '$productDetails.ProductName',
          Price: '$productDetails.DiscountAmount',
          Status: '$productDetails.Status',
          images: '$productDetails.images',
          TotalSold: '$totalSold',
        },
      },
    ]);

    res.json({ yearlyBestSellingProducts });
  } catch (error) {
    console.error('Error fetching yearly best-selling product data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
},



getAdminLogout: (req, res) => {
  if (req.session.admin) {
      req.session.admin = null;
      res.clearCookie("adminJwt");
  }
  res.redirect("/admin/login");
},

    
};