const User = require("../models/userSchema");
const flash = require("express-flash");
const Admin = require("../models/adminSchema")
const Brand=require("../models/brandSchema")


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
        const adminName = req.session.admin.Name; // Access the admin's Name from the session
        res.render("admin/dashboard", { adminName }); // Pass the Name to your template
    },

    getUser: async (req, res) => {
        try {
          const adminName = req.session.admin.Name;
          const users = await User.find({}).sort({ Username: 1 });
    console.log("users are :",users)
          res.render("admin/manageUsers", {
            users,
            adminName,
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


    getAdminLogout: (req, res) => {
        req.session.admin = false;
        res.clearCookie("adminJwt");
        res.redirect("/admin/login");
      },
    
};