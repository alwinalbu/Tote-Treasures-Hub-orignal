const User = require("../models/userSchema");
const flash = require("express-flash");
const Admin = require("../models/adminSchema")
const Brand=require("../models/brandSchema")
const Order=require('../models/orderSchema')
const Products=require('../models/productSchema')
const Category = require('../models/categorySchema')


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
            res.render("admin/adminLogin");
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

getproductsdaily: async (req, res) => {
  try {
      console.log("reached inside of daily products");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      console.log("date today is :",today)

      const dailyProducts = await Order.aggregate([
          {
              $match: {
                  OrderDate: { $gte: today },
              },
          },
          {
              $unwind: '$Items',
          },
          {
              $lookup: {
                  from: 'products', 
                  localField: 'Items.ProductId',
                  foreignField: '_id',
                  as: 'productDetails',
              },
          },
          {
              $unwind: '$productDetails',
          },
          {
              $lookup: {
                  from: 'Categories', 
                  localField: 'productDetails.Category',
                  foreignField: '_id',
                  as: 'categoryDetails',
              },
          },
          {
              $project: {
                  _id: '$productDetails._id',
                  ProductName: '$productDetails.ProductName',
                  Price: '$productDetails.DiscountAmount',
                  Status: '$productDetails.Status',
                  Category: {
                      _id: '$categoryDetails._id',
                      Name: '$categoryDetails.Name',
                      image: '$categoryDetails.image',
                  },
                  images: '$productDetails.images',
              },
          },
      ]);

      console.log("After aggregation pipeline:", dailyProducts);

      res.json({ products: dailyProducts });

      console.log("daily answer is: ",dailyProducts)

  } catch (error) {
      console.error('Error fetching daily product data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
},

// getproductsdaily: async (req, res) => {
//     try {
//         console.log("Reached inside of daily products");
  
//         let today = new Date();
//         today.setUTCHours(0, 0, 0, 0);
//         console.log("Date today is:", today);
  
//         dailyProducts = await Order.aggregate([
//             {
//                 $match: {
//                     OrderDate: { $gte: today },
//                 },
//             },
//         ]);
  
//         console.log("After $match stage:", dailyProducts);
  
//         dailyProducts = await Order.aggregate([
//             {
//                 $match: {
//                     OrderDate: { $gte: today },
//                 },
//             },
//             {
//                 $unwind: '$Items',
//             },
//         ]);
  
//         console.log("After $unwind '$Items' stage:", dailyProducts);
  
//         dailyProducts = await Order.aggregate([
//             {
//                 $match: {
//                     OrderDate: { $gte: today },
//                 },
//             },
//             {
//                 $unwind: '$Items',
//             },
//             {
//                 $lookup: {
//                     from: 'products', 
//                     localField: 'Items.ProductId',
//                     foreignField: '_id',
//                     as: 'productDetails',
//                 },
//             },
//         ]);
  
//         console.log("After $lookup 'products' stage:", dailyProducts);
  
//         dailyProducts = await Order.aggregate([
//             {
//                 $match: {
//                     OrderDate: { $gte: today },
//                 },
//             },
//             {
//                 $unwind: '$Items',
//             },
//             {
//                 $lookup: {
//                     from: 'products', 
//                     localField: 'Items.ProductId',
//                     foreignField: '_id',
//                     as: 'productDetails',
//                 },
//             },
//             {
//                 $unwind: '$productDetails',
//             },
//         ]);
  
//         console.log("After $unwind '$productDetails' stage:", dailyProducts);
  
//         dailyProducts = await Order.aggregate([
//             {
//                 $match: {
//                     OrderDate: { $gte: today },
//                 },
//             },
//             {
//                 $unwind: '$Items',
//             },
//             {
//                 $lookup: {
//                     from: 'products', 
//                     localField: 'Items.ProductId',
//                     foreignField: '_id',
//                     as: 'productDetails',
//                 },
//             },
//             {
//                 $unwind: '$productDetails',
//             },
//             {
//                 $lookup: {
//                     from: 'Categories', 
//                     localField: 'productDetails.Category',
//                     foreignField: '_id',
//                     as: 'categoryDetails',
//                 },
//             },
//         ]);
  
//         console.log("After $lookup 'Categories' stage:", dailyProducts);
  
//         dailyProducts = await Order.aggregate([
//             {
//                 $match: {
//                     OrderDate: { $gte: today },
//                 },
//             },
//             {
//                 $unwind: '$Items',
//             },
//             {
//                 $lookup: {
//                     from: 'products', 
//                     localField: 'Items.ProductId',
//                     foreignField: '_id',
//                     as: 'productDetails',
//                 },
//             },
//             {
//                 $unwind: '$productDetails',
//             },
//             {
//                 $lookup: {
//                     from: 'Categories', 
//                     localField: 'productDetails.Category',
//                     foreignField: '_id',
//                     as: 'categoryDetails',
//                 },
//             },
//             {
//                 $project: {
//                     _id: '$productDetails._id',
//                     ProductName: '$productDetails.ProductName',
//                     Price: '$productDetails.DiscountAmount',
//                     Status: '$productDetails.Status',
//                     Category: {
//                         _id: '$categoryDetails._id',
//                         Name: '$categoryDetails.Name',
//                         image: '$categoryDetails.image',
//                     },
//                     images: '$productDetails.images',
//                 },
//             },
//         ]);
  
//         console.log("After $project stage:", dailyProducts);
  
//         res.json({ products: dailyProducts });
  
//     } catch (error) {
//         console.error('Error fetching daily product data:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
//   },
  


    getAdminLogout: (req, res) => {
        req.session.admin = false;
        res.clearCookie("adminJwt");
        res.redirect("/admin/login");
      },
    
};