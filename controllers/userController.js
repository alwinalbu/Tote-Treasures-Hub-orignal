const User = require('../models/userSchema')
const Category = require('../models/categorySchema')
const Product = require('../models/productSchema')
const Brand = require('../models/brandSchema')
const Cart = require("../models/cartSchema")
const Order = require("..//models/orderSchema");
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const flash = require("express-flash")
const otpFunctions = require('../utility/otpFunctions')
const OTP = require('../models/otpSchema')
const session = require('express-session');
const crypto = require("crypto");
const razorpay = require("../utility/razorpay");
const mongoose = require('mongoose');
const passport = require('passport');




module.exports = {
    initial: async (req, res) => {
        try {
            const categories = await Category.find();
            const products = await Product.find({ Display: "Active" })
            res.render("user/landingpage", { user: '', products, categories });
        } catch (error) {
            console.log(error);
        }
    },

    googleSignIn :passport.authenticate('google', {
        scope: ['profile', 'email']
    }),

  
    googleSignInCallback: async (req, res) => {
        passport.authenticate('google', { 
            successRedirect: '/homepage', 
            failureRedirect: '/login', 
            failureFlash: true 
        })(req, res);
    },

    home: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; // Get the page from the query parameters
            const limit = 8; // Set the number of products per page
    
            const categories = await Category.find();
            const totalProductsCount = await Product.countDocuments({ Display: "Active" });
    
            const totalPages = Math.ceil(totalProductsCount / limit);
            const skip = (page - 1) * limit;
    
            const products = await Product.find({ Display: "Active" })
                .skip(skip)
                .limit(limit);
    
            res.render("user/homepage", {
                user: req.session.user,
                products,
                categories,
                currentPage: page,
                totalPages
            });
        } catch (error) {
            console.log(error);
            // Handle the error appropriately, send an error response, etc.
            res.status(404).send("An error occurred");
        }
    },


    shop: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; // Get the page from the query parameters
            const limit = 8; // Set the number of products per page
    
            const categories = await Category.find();
            const totalProductsCount = await Product.countDocuments({ Display: "Active" });
    
            const totalPages = Math.ceil(totalProductsCount / limit);
            const skip = (page - 1) * limit;
    
            const products = await Product.find({ Display: "Active" })
                .skip(skip)
                .limit(limit);
    
            res.render("user/shop", {
                user: req.session.user,
                products,
                categories,
                currentPage: page,
                totalPages
            });
        } catch (error) {
            console.log(error);
            // Handle the error appropriately, send an error response, etc.
            res.status(500).send("An error occurred");
        }
    },

    

    login: (req, res) => {
        res.render('user/login', { error: req.session.error, user:"" });
    },

    userLogin: async (req, res) => {
        try {
            // Extract email and password from req.body
            const email = req.body.Email;
            const password = req.body.Password;

            // Attempt to find a user in the database based on the provided email.
            const user = await User.findOne({ Email: email });

            console.log('login email', email);
            console.log('user:', user);

            // Check if the user exists and their status is "Active" before proceeding.
            if (user) {
                if (user.Status === "Active") {
                    // Compare the provided password with the stored hashed password.
                    const passwordMatch = await bcrypt.compare(password, user.Password);

                    console.log('Password:', password);
                    console.log('Password Match:', passwordMatch);

                    // If the passwords match, create a JSON Web Token (JWT).
                    if (passwordMatch) {
                        const accessToken = jwt.sign(
                            { user: user._id },
                            process.env.ACCESS_TOKEN_SECRET,
                            { expiresIn: '1h' } // Set the expiration time as needed
                        );

                        // Set the JWT as a cookie.
                        res.cookie('userJwt', accessToken, { maxAge: 60 * 60 * 1000 });

                        // Store user information in the session.
                        req.session.user = user;

                        // Redirect to the user's homepage.
                        return res.redirect('/homepage');
                    } else {
                        // If passwords don't match, show an error and redirect to the login page.
                        req.flash('error', 'Invalid username or password');
                        return res.redirect('/login');
                    }
                } else {
                    // If the user's status is not "Active," show an error and redirect to the login page.
                    req.flash('error', 'User is Blocked');
                    return res.redirect('/login');
                }
            } else {
                // If no user is found, show an error and redirect to the login page.
                req.flash('error', 'User Email is NOT Verified So please Verify With OTP');
                return res.redirect('/login');
            }
        } catch (error) {
            // Handle any errors that occur during the process.
            console.error(error);
            req.flash('error', 'An error occurred during login');
            res.redirect('/login');
        }
    },


    signup: (req, res) => {
        const error = req.flash('error'); // Get the error message from flash (if it exists)
        res.render("user/signup", { err: error, user: '' });
    },


    postUserSignup: async (req, res) => {
        try {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);

            const username = req.body.Username;
            const password = req.body.Password;
            const confirmPassword = req.body.confirmPassword;

            if (password && confirmPassword) {
                const hashedPassword = await bcrypt.hash(password, salt);
                const hashedConfirmPassword = await bcrypt.hash(confirmPassword, salt);

                // Log the hashed password and hashedConfirmPassword
                console.log('Hashed Password:', hashedPassword);
                console.log('Hashed Confirm Password:', hashedConfirmPassword);

                const email = req.body.Email;

                req.session.user = {
                    Username: username,
                    Email: email,
                    Password: hashedPassword
                };

                const existingUser = await User.findOne({ Email: email });

                if (existingUser) {
                    req.flash("error", "Email already exists");
                    console.log("Email already exists");
                    res.redirect("/signup");
                } else {
                    otpToBeSent = otpFunctions.generateOTP();
                    const result = otpFunctions.sendOTP(req, res, email, otpToBeSent);
                }

                // Compare the hashed password and hashedConfirmPassword
                if (hashedPassword === hashedConfirmPassword) {
                    console.log('Password and ConfirmPassword match.');
                } else {
                    console.log('Password and ConfirmPassword do not match.');
                }
            } else {
                req.flash("error", "Passwords are missing");
                res.redirect("/signup");
            }
        } catch (error) {
            console.error(error);
            req.flash("error", "An error occurred during signup.");
            res.redirect("/signup");
        }
    },


    getemailVerification: async (req, res) => {
        try {
            // email is taken from the input 
            const Email = req.session.user.Email;

            // a timeout function to deleted the old otp after 1 minute
            setTimeout(() => {
                OTP.deleteOne({ Email: Email })
                    .then(() => {
                        console.log("Document deleted successfully");
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }, 60000);
            res.render("user/emailVerification", { messages: req.flash(), user: '' });
        } catch (error) {
            console.log(error);
            res.redirect("/signup");
        }
    },

    postEmailVerification: async (req, res) => {
        try {
            const userData = await User.create(req.session.user);
            if (userData) {
                const accessToken = jwt.sign(
                    { user: userData._id },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: 60 * 60 }
                );

                // Set the cookie before sending any response
                res.cookie("userjwt", accessToken, { maxAge: 60 * 1000 * 60 });

                // Then redirect to the ajax
                // res.redirect('/homepage');
                res.json({
                    success: true,
                    redirectUrl: '/homepage',
                    user: req.session.user
                  });

            } else {
                req.flash("error", "Invalid Email Address");
                console.log("Invalid Email Address");
                res.redirect('/signup');
            }
        } catch (error) {
            console.error(error);
            res.redirect('/signup');
        }
    },

    otpAuth: async (req, res, next) => {
        try {
            const { otp } = req.body;
            const Email = req.session.user.Email;

            console.log("User-provided OTP:", otp);
            console.log("Email:", Email);

            // Check for an OTP record in the database
            const matchedOTPrecord = await OTP.findOne({
                Email: Email,
            })

            console.log("Matched OTP record from the database:", matchedOTPrecord);

            if (!matchedOTPrecord) {
                throw new Error("No OTP records found for the provided email.");
            }

            const { expiresAt } = matchedOTPrecord;
            console.log("Expires At:", expiresAt);

            if (expiresAt) {
                if (expiresAt < Date.now()) {
                    await OTP.deleteOne({ Email: Email });
                    throw new Error("The OTP code has expired. Please request a new one.");
                }
            } else {
                console.log("ExpiresAt is not defined in the OTP record.");
            }

            console.log("Stored OTP from the database:", matchedOTPrecord.otp);

            if (Number(otp) === matchedOTPrecord.otp) {
                req.session.OtpValid = true;
                // res.json({success:true})
                next();
            } else {
                console.log("Entered OTP does not match stored OTP.");
                req.flash("error", "Invalid OTP. Please try again.");
                res.redirect("/emailVerification");
            }
        } catch (error) {
            console.error(error);
            res.redirect("/emailverification");
        }
    },

    resendOtp: async (req, res) => {
        try {
            const duration = 60;
            const Email = req.session.user.Email;
            otpToBeSent = otpFunctions.generateOTP();
            console.log(otpToBeSent);
            const result = otpFunctions.resendOTP(req, res, Email, otpToBeSent);
        } catch (error) {
            console.log(error);
            req.flash("error", "error sending OTP");
            res.redirect("/emailVerification");
        }
    },

    forgotpassword: (req, res) => {
        res.render("user/forgotPassword", {
            messages: req.flash(), user: req.session.user
        });
    },
    postforgotpassword: async (req, res) => {
        try {
            req.session.Email = req.body.Email;
            const Email = req.body.Email;
            console.log("1223", Email)
            const userData = await User.findOne({ Email: Email });
            console.log("user email is :", userData)
            if (userData) {
                if (userData.Status === "Active") {

                    otpToBeSent = otpFunctions.generateOTP();
                    const result = otpFunctions.passwordsendOTP(req, res, Email, otpToBeSent);

                } else {

                    req.flash("error", "Email is BLocked ");
                    res.redirect("/forgotpassword")
                }

            } else {
                req.flash("error", "Email Not Registesred");
                res.redirect("/forgotpassword")
            }
        } catch (error) {
            console.log(error);
            res.redirect("/login")
        }
    },

    PasswordResendOtp: async (req, res) => {
        try {
            const duration = 60;
            const Email = req.session.Email;
            console.log("resend email is ", Email);
            otpToBeSent = otpFunctions.generateOTP();
            console.log(otpToBeSent);
            const result = otpFunctions.passwordresendOTP(req, res, Email, otpToBeSent);
        } catch (error) {
            console.log(error);
            req.flash("error", "Error sending OTP");
            res.redirect("/forgotpassword");
        }
    },

    getOtpVerification: async (req, res) => {
        try {
            // email is taken from the input 
            const Email = req.session.Email;
            console.log("this is new eamil", Email);
            // a timeout function to deleted the old otp after 1 minute
            setTimeout(() => {
                OTP.deleteOne({ Email: Email })
                    .then(() => {
                        console.log("Document deleted successfully");
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }, 60000);
            res.render("user/otpVerification", { messages: req.flash(), user: req.session.user });
        } catch (error) {
            console.log(error);
            res.redirect("/login");
        }
    },
    passwordOtpAuth: async (req, res, next) => {
        try {

            let { otp } = req.body;

            // Ensure an OTP record exists for the email
            console.log(req.session.Email);
            const matchedOTPrecord = await OTP.findOne({
                Email: req.session.Email,
            });

            if (!matchedOTPrecord) {
                throw new Error("No OTP records found for the provided email.");
            }

            const { expiresAt } = matchedOTPrecord;
            console.log("Expires At:", expiresAt);

            if (expiresAt) {
                if (expiresAt < Date.now()) {
                    await OTP.deleteOne({ Email: Email });
                    throw new Error("The OTP code has expired. Please request a new one.");
                }
            } else {
                console.log("ExpiresAt is not defined in the OTP record.");
            }

            console.log("Stored OTP from the database:", matchedOTPrecord.otp);

            if (Number(otp) === matchedOTPrecord.otp) {
                req.session.OtpValid = true;
                next();
            } else {
                console.log("Entered OTP does not match stored OTP.");
                req.flash("error", "Invalid OTP. Please try again.");
                res.redirect("/otpVerification");
            }
        } catch (error) {
            console.error(error);
            res.redirect("/login");
        }
    },

    postOtpVerification: async (req, res) => {
        try {
            res.json({ success: true })
            // res.redirect('/createNewPassword')
        } catch (error) {
            console.log(error);
            res.redirect("/login");
        }
    },

    getCreateNewPassword: async (req, res) => {
        res.render('user/changePassword', { messages: req.flash(), user: req.session.user })
    },

    postCreateNewPassword: async (req, res) => {
        try {
            const user = await User.findOne({ Email: req.session.Email });

            const pass = req.body.Password;
            console.log(pass);

            const hashedPassword = await bcrypt.hash(req.body.Password, 8);

            const updatedUser = await User.updateOne({ _id: user._id }, { $set: { Password: hashedPassword } });

            if (!updatedUser) {
                throw new Error('Error updating password');
            }

            const accessToken = jwt.sign(
                { user: user._id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: 60 * 60 }
            );
            res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 });
            req.session.user = user;
            res.redirect("/homepage");
        } catch (error) {
            console.log(error);
            res.redirect("/login");
        }
    },

    getproductViewDetailspage: async (req, res) => {
        const _id = req.params.id; // Use req.params.id
        const categories = await Category.find();
        const brands = await Brand.find();
        const product = await Product.findOne({ _id }).populate('Category BrandName');
        console.log(product);

        res.render("./user/productViewDetailspage", {
            product,
            categories,
            brands,
            user: req.session.user,
            wishlist: req.session.user ? req.session.user.wishlist : null,
        });
    },


// --------------------------------------------seacrh---------------------------------------------------------------

searchByTags: async (req, res) => {
    try {
        const { searchTags } = req.query;
        
        console.log('Search tags:', searchTags); // Log the search tags

        const products = await Product.find();

        const searchArray = [];

        products.forEach(product => {
            if (Array.isArray(product.Tags)) {
                searchArray.push(...product.Tags);
            }
        });

        console.log("search products:", searchArray);
        
        const splitTags = [];

        for (let i = 0; i < searchArray.length; i++) {
            const tags = searchArray[i].split(',');
            splitTags.push(...tags);
        }

        console.log("split tags are ", splitTags);

        // Filter products based on searchTags
        const filteredProducts = products.filter(product => {
            if (Array.isArray(product.Tags)) {
                const productTags = product.Tags
                    .map(tag => tag.split(',').map(t => t.trim().toLowerCase())); // Split and trim tags, convert to lowercase for consistency
        
                const searchTagsArray = splitTags.map(tag => tag.trim().toLowerCase()); // Ensure search tags are trimmed and in lowercase
        
                // Check if at least one tag from searchTagsArray exists in productTags
                return productTags.some(tags => searchTagsArray.some(searchTag => tags.includes(searchTag)));
            }
            return false;
        });

        console.log("filtered products:", filteredProducts);

        res.render('user/searchResults', { user: "", products: filteredProducts });

    } catch (error) {
        console.log(error);
    }
},




// ------------------------------------Category Selection-----------------------------------------------------------

// CategoriesSelect: async(req,res){

// const catid=req.params._id;









// },

    // ---------------------addtocart------------------------------------------------------------------------------


    addtocart: async (req, res) => {
        console.log("user session user is ", req.session.user);

        const userid = req.session.user.user;

        console.log("userid is:", userid);

        const productid = req.params._id;

        console.log("product id is ", productid);

        const usercart = await Cart.findOne({ UserId: userid });

        console.log("cart is there for user :", usercart)

        if (usercart) {

            const existingItem = usercart.Items.find((item) => {
                if (item.ProductId && item.ProductId.equals) {
                    return item.ProductId.equals(productid);
                }
                return false;
            });

            if (existingItem) {

                existingItem.Quantity += 1;
            } else {
                usercart.Items.push({ ProductId: productid, Quantity: 1 });
            }

            await usercart.save();
            console.log("existing cart is here  updated:", usercart);

        } else {
            const newcart = new Cart({
                UserId: userid,
                Items: [{ ProductId: productid, Quantity: 1 }],
            });
            await newcart.save();

            console.log("new cart is here  updated:", newcart);
        }
        res.redirect('/cartpage');

    },




    // --------------------------------cartpage----------------------------------------------------------------


    getCartpage: async (req, res) => {
        try {
            const userId = req.session.user.user;
            console.log("user id is to get page here ", userId);
    
            const user = await User.findById(userId);
            console.log("after finding the user is", user);
    
            const cart = await Cart.findOne({ UserId: userId }).populate("Items.ProductId");
            console.log("cart in getCartpage:", cart);
    
            if (!user || !cart) {
                return res.status(404).send("User or cart not found");
            }
    
            res.render("user/cartpage", { user, cart });
        } catch (error) {
            console.error("Error in getCartpage:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    


    postCart: async (req, res) => {

        req.session.totalPrice = parseInt(req.body.totalPrice);

        console.log("TOTTAL PRICE in session ", req.session.totalPrice)

        res.json({ success: true })
        
    },




    // ----------------------------------------------update Quantity -------------------------------------------------
    updateQuantity: async (req, res) => {
        try {
            const { productId, change } = req.body;

            const userId = req.session.user.user;

            console.log("update side userid", userId)

            const usercart = await Cart.findOne({ UserId: userId });
            const product = await Product.findById(productId);

            console.log("usercart is here", usercart);
            console.log("product is here", product)

            if (!usercart || !product) {
                return res.status(404).json({ error: "Product or Cart cannot be Found " })
            };
            const cartItem = usercart.Items.find((item) =>
                item.ProductId.equals(productId)
            );

            const newQuantity = cartItem.Quantity + parseInt(change);
            if (newQuantity < 1) {
                usercart.Items = ProductId.Items.filter((item) => !item.ProductId.equals(productId));
            } else {
                cartItem.Quantity = newQuantity;
            }

            await usercart.save();
            res.json({ message: "Quantity Updated Successfully", newQuantity })
        } catch (error) {
            console.error("Error updating quantity:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },


    // -------------------------------remove from cart----------------------------------------------------------------



    removeItemFromCart: async (req, res) => {

        const userId = req.session.user.user;

        const user = await User.findById(userId);

        console.log("user for delete is user",user);

        const productId = req.params._id;

        const updateCart = await Cart.findOneAndUpdate({ UserId: user },
            { $pull: { Items: { ProductId: productId } } },
            { new: true }
        );
        console.log(" cart after deletion :", updateCart);

        res.redirect("/cartpage")

    },


    // --------------------------------------------User Profile------------------------------------------

    profile: async (req, res) => {
        const userId = req.session.user.user;
        const user = await User.findById(userId);
       
        console.log(req.session.user);
        res.render("user/userprofile", {
            user,
        });
    },

    changePassword: async (req, res) => {

        const userId = req.session.user.user;

        console.log("Came insdie the Password change ");
    
        try {
            const user = await User.findById(userId);
            const dbPassword = user.Password;
            
            const passwordIsValid = await bcrypt.compare(req.body.currentPassword, dbPassword);

            console.log("password", passwordIsValid);
    
            if (passwordIsValid) {
                // Check if the new password is the same as the current one
                const isNewPasswordSameAsCurrent = await bcrypt.compare(req.body.Password, dbPassword);
    
                if (isNewPasswordSameAsCurrent) {
                    // New password cannot be the same as the current one
                    res.status(400).json({
                        error: "New Password cannot be the same as the current one",
                        retry: true, 
                    });
                } else if (req.body.Password === req.body.confirmPassword) {

                    // Passwords match, update the password
                    const passwordHashed = await bcrypt.hashSync(req.body.Password, 8);
                    const result = await User.updateOne(
                        { _id: userId },
                        { $set: { Password: passwordHashed } },
                        { new: true }
                    );
                    res.json({
                        success: true,
                        message: "Password changed successfully",
                    });
                } else {
                    // New password and confirm password do not match
                    res.status(400).json({ error: "New Password and Confirm Password do not match" });
                }
            } else {
                // Current password is incorrect
                res.status(400).json({ error: "Current Password is incorrect" });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false, error: err.message || "Password change failed" });
        } 
    },
    

    // ------------------------------------------get address page--------------------------------------------


    getEditAddress: async (req, res) => {
        const userId = req.session.user.user;
        const user = await User.findById(userId);
        console.log(user.Address);
        res.render("user/editAddress", { user });
    },

    //   -----------------------------------------------add new address------------------------------------------


    postAddressForm: async (req, res) => {
        const userId = req.session.user.user;
        const address = await User.findByIdAndUpdate(
            userId,
            { $push: { Address: req.body } },
            { new: true }
        );
        // console.log("Adress which got added is this ",address);
        req.flash("success", "Address Added successfully");
        res.redirect("/editAddress");

    },

    // ------------------------------------------------edit address-------------------------------------------------

    postEditAddress: async (req, res) => {

        const addressId = req.params._id;

        const userId = req.session.user.user;

        console.log("user id is ", userId);

        const user = await User.findById(userId)

        try {
            if (user) {

                const { Name, AddressLane, City, State, Pincode, Mobile } = req.body

                const addressIndex = user.Address.findIndex((a) => a._id.toString() === addressId);

                if (addressIndex !== -1) {

                    user.Address[addressIndex].Name = Name;
                    user.Address[addressIndex].AddressLane = AddressLane;
                    user.Address[addressIndex].City = City;
                    user.Address[addressIndex].State = State;
                    user.Address[addressIndex].Pincode = Pincode;
                    user.Address[addressIndex].Mobile = Mobile;

                    await user.save();


                    console.log("Address updated successfully");
                    req.flash("success", "Address updated successfully");
                    res.redirect("/editAddress");

                } else {
                    console.log("Address Not Found")
                    req.flash("error", "Address Not Found")
                    res.redirect("/editAddress");
                }

            } else {
                req.flash("error", "User Not Found")
                res.redirect("/editAddress");
            }

        } catch (error) {
            req.flash("error", "Error In Updating Address")
            res.redirect("/editAddress");
        }

    },

    // -----------------------------------------delete the address--------------------------------------------------------


    deleteAddress: async (req, res) => {
        console.log('test');
        const userId = req.session.user.user;
        const addressId = req.params._id; // Assuming you receive the address ID to delete from the request parameters

        console.log("address id is to delete", addressId)
        try {
            const user = await User.findById(userId);

            if (!user) {
                console.log("User not found");
                req.flash("error", "User not found");
                return res.redirect("/editAddress");
            }

            const addressIndex = user.Address.findIndex(
                (a) => a._id.toString() === addressId
            );

            if (addressIndex === -1) {
                console.log("Address not found");
                req.flash("error", "Address not found");
                return res.redirect("/editAddress");
            }

            user.Address.splice(addressIndex, 1); // Removing the address at the found index

            await user.save();

            console.log("Address deleted successfully");
            req.flash("success", "Address deleted successfully");
            return res.redirect("/editAddress");
        } catch (error) {
            console.error("Error deleting address:", error.message);
            req.flash("error", "Error deleting address");
            return res.status(500).send("Internal Server Error");
        }
    },

    //   --------------------------------------------------Orderlist--------------------------------------------------------

    getOrderlist: async (req, res) => {

        const userId = req.session.user.user;

        const user = await User.findById(userId);

        const order = await Order.find({ UserId: userId })

        res.render("user/orderlist", { user, order })

    },


    getOrderDetails: async (req, res) => {
        try {
            const userId = req.session.user.user;

            console.log("userid is", userId);

            const user = await User.findById(userId);

            const orderId = req.params._id;

            const order = await Order.findById(orderId).populate("Items.ProductId");

            const addressId = order.Address._id;
            console.log(addressId, "ADDRESSiD");

            console.log(order, "order");
            res.render("user/orderdetails", { user, order });
        } catch (error) {
            console.log(error);
        }
    },

// -------------------------------------------------------order cancel---------------------------------------------

    cancelOrder: async (req, res) => {
        const orderId = req.params._id;
        try {
          const order = await Order.findById(orderId);
      
          if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
          }
      
          if (order.Status === "Order Placed" || order.Status === "Shipped") {
            
            const productsToUpdate = order.Items;
      
            for (const product of productsToUpdate) {
              const dbProduct = await Product.findById(product.ProductId);
      
              if (dbProduct) {
                dbProduct.AvailableQuantity += product.Quantity;
                await dbProduct.save();
              }
            }
      
            order.Status = "Cancelled";
            await order.save();
      
            return res.status(200).json({ success: true, message: "Order successfully cancelled" });
          } else {
            return res.status(400).json({ success: false, message: "Order cannot be cancelled" });
          }
        } catch (error) {
          console.error("Error cancelling the order:", error);
          return res.status(500).json({ success: false, message: "Error cancelling the order" });
        }
      },
      


    // -------------------------------------------------checkout page-----------------------------------------------------

    getCheckout: async (req, res) => {
        const userId = req.session.user.user;
        console.log("user id is to checkout ", userId)
        const user = await User.findById(userId);
        const cart = await Cart.findOne({ UserId: userId }).populate(
            "Items.ProductId"
        );
        if (!cart) {
            res.redirect('/cartpage')
        } else {
            res.render("user/checkout", { messages: req.flash(), user });
        }
    },

    //  ----------------------------------post Checkout server side ----------------------------------------------------


    postCheckout: async (req, res) => {

        console.log("reached here for postcheckout ", req.body);

        const PaymentMethod = req.body.paymentMethod;

        console.log("paymentmethod is", PaymentMethod);

        const Address = req.body.Address;
        const userId = req.session.user.user;
        const amount = req.session.totalPrice;

        console.log("address before checkout is", Address);

        const user = await User.findById(userId);

        const Email = user.Email;

        const cart = await Cart.findOne({ UserId: userId }).populate("Items.ProductId");

        console.log("total price before checkout is :", req.session.totalPrice);

        const addressData = await User.findOne({
            _id: userId,
        },
            {
                Address: {
                    $elemMatch: { _id: new mongoose.Types.ObjectId(Address) }
                }
            });

        console.log("address is selcted for checkout is : ", addressData.Address[0].AddressLane);


        if (addressData && addressData.Address) {
            const add = {
                Name: addressData.Address[0].Name,
                Address: addressData.Address[0].AddressLane, // Using 'AddressLane' from the User schema
                Pincode: addressData.Address[0].Pincode.toString(), // Ensure Pincode is converted to String
                City: addressData.Address[0].City,
                State: addressData.Address[0].State,
                Mobile: addressData.Address[0].Mobile,
            };
            console.log("add is heres", add);

            const currentDate = new Date();
            const fourDaysFromNow = new Date(currentDate);
            fourDaysFromNow.setDate(currentDate.getDate() + 4);

          

            const newOrders = new Order({
                UserId: userId,
                Items: cart.Items,
                OrderDate:currentDate,
                fourDaysFromNow,
                TotalPrice: amount,
                Address: add,
                PaymentMethod: PaymentMethod,
            });

            await Cart.findByIdAndDelete(cart._id);

            const order = await newOrders.save();

           console.log("delivery date is ", fourDaysFromNow)

            console.log("new order which is saved is ", order);

            req.session.orderId = order._id;
            //   ---------------------------------------------stock modifying-----------------------------------------------

            for (const item of order.Items) {

                const productId = item.ProductId;
                const quantity = item.Quantity;

                const product = await Product.findById(productId);

                if (product) {
                    const updatedQuantity = product.AvailableQuantity - quantity;

                    if (updatedQuantity <= 0) {
                        product.AvailableQuantity = 0;
                        product.Status = "Out of Stock";
                        await product.save();
                    } else {
                        product.AvailableQuantity = updatedQuantity;
                        await product.save();
                    }
                }
            }
            //   -------------------------------------------COD------MAIL SENDING ------------------------------------------------------
            if (PaymentMethod === "cod") {
                // Email for Cash on Delivery
                const transporter = nodemailer.createTransport({
                    port: 465,
                    host: "smtp.gmail.com",
                    auth: {
                        user: "totetreasureshub@gmail.com",
                        pass: "ceyv ctlk khzq tkrg",
                    },
                    secure: true,
                });

                const mailData = {
                    from: "totetreasureshub@gmail.com",
                    to: Email,
                    subject: "Your Orders!",
                    text:
                        `Hello! ${user.Username} Your order has been received and will be processed within ${fourDaysFromNow} days.` +
                        ` your total price is ${req.session.totalPrice}`,
                };

                transporter.sendMail(mailData, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log("Success");
                });

                res.json({ codSuccess: true });
            } else {

                try {
                    const orderData = {
                        amount: amount,
                        currency: "INR",
                        receipt: req.session.orderId,
                    };

                    const createdOrder = await razorpay.createRazorpayOrder(orderData);

                    console.log("payment response", createdOrder);

                    res.json({ createdOrder, orderData });

                } catch (err) {
                    console.log(err);
                    // Handle the error, perhaps send an error response
                    res.status(500).json({ error: 'An error occurred' });
                }

            }
        } else {
            // Handle the case where address data is not found
            console.error('Address data not found.');
            // You might want to send an error response or handle this case appropriately
        }
    },
        // -----------------------------------------------END-----------------------------------------------------------------------------------







        // ------------------------------------------------------verifyPayment-------------------------------------------------------------------

        verifyPayment: async (req, res) => {

            console.log("vewrify payment body inside ", req.body);

            let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);

            hmac.update(
                req.body.payment.razorpay_order_id +
                "|" +
                req.body.payment.razorpay_payment_id
            );

            hmac = hmac.digest("hex");
            if (hmac === req.body.payment.razorpay_signature) {

                const orderId = new mongoose.Types.ObjectId(
                    req.body.order.createdOrder.receipt
                );
                const updateOrderDocument = await Order.findByIdAndUpdate(orderId, {
                    PaymentStatus: "Paid",
                    PaymentMethod: "Online",
                });

                console.log("hmac success");
                res.json({ success: true });
            } else {
                console.log("hmac failed");
                res.json({ failure: true });
            }
        },











            // -----------------------------------------------------Address adding in checkoutpage---------------------------------------------------

            addAddressCheckout: async (req, res) => {
                const userId = req.session.user.user;
                const address = await User.findByIdAndUpdate(
                    userId,
                    { $push: { Address: req.body } },
                    { new: true }
                );
                req.flash("success", "New Address Added successfully");
                res.redirect("/checkout");
            },

                // --------------------------------------------------OrderSuccess--------------------------------------------------------


                getOrderSucces: async (req, res) => {
                    const userId = req.session.user.user;
                    const user = await User.findById(userId);
                    res.render("user/orderSuccess", { user });
                },




                    // -----------------------------------------------------user logout-------------------------------------------------



                    getUserLogout: (req, res) => {
                        req.session.user = false;
                        res.clearCookie("userJwt");
                        res.redirect("/login");
                    },

};

