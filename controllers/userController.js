const User = require('../models/userSchema')
const Category = require('../models/categorySchema')
const Product = require('../models/productSchema')
const Brand = require('../models/brandSchema')
const Cart = require("../models/cartSchema")
const Order = require("..//models/orderSchema");
const Coupon = require('../models/couponSchema')
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
const invoice = require('../utility/invoice')
const Wallet = require('../models/walletSchema')
const { generateReferralCode } = require('../utility/generateReferralCode')
const path = require('path');




module.exports = {
    initial: async (req, res) => {
        try {
            const categories = await Category.find();
            const products = await Product.find({ Display: "Active" }).populate('offer');
            // Assuming your offer field in the Product model is named 'offer'

            res.render("user/landingpage", { user: '', products, categories });
        } catch (error) {
            console.log(error);
        }
    },

    GetAboutpage: async(req,res)=>{
        try {
            res.render('user/aboutus',)
        } catch (error) {
            res.render('errorpage'); 
        }
    },

    GetConatctpage:async(req,res)=>{
        try {
            res.render('user/contactUs',)
        } catch (error) {
            res.render('errorpage'); 
        }
    },

    googleSignIn: passport.authenticate('google', {
        scope: ['profile', 'email']
    }),


    googleSignInCallback: async (req, res) => {
        passport.authenticate('google', {
            successRedirect: '/login',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res);
    },

    // home: async (req, res) => {
    //     try {
    //         const page = parseInt(req.query.page) || 1; 
    //         const limit = 8; 

    //         const categories = await Category.find();
    //         const totalProductsCount = await Product.countDocuments({ Display: "Active" })

    //         const totalPages = Math.ceil(totalProductsCount / limit);
    //         const skip = (page - 1) * limit;

    //         const products = await Product.find({ Display: "Active" })
    //             .skip(skip)
    //             .limit(limit)
    //             .populate('offer');

    //             const user = req.session.user

    //             console.log("user inside homapage is",user)

    //         const userId = req.session.user._id

    //         console.log("userID in homepage is", userId);

    //         const userCart = await Cart.findOne({ UserId: userId });


    //         const totalQuantity = userCart ? userCart.Items.reduce((acc, item) => acc + item.Quantity, 0) : 0;

    //         req.session.cartCount = totalQuantity;

    //         const cartCount = req.session.cartCount

    //         console.log('user cart count is ', cartCount);

    //         res.render("user/homepage", {
    //             user: req.session.user,
    //             products,
    //             categories,
    //             currentPage: page,
    //             totalPages,
    //             cartCount
    //         });
    //     } catch (error) {
    //         console.log(error);
    //         // Handle the error appropriately, send an error response, etc.
    //         res.status(404).send("An error occurred");
    //     }
    // },

    home: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; 
            const limit = 8; 
    
            const user = req.session.user;
    
            // Check if the user is logged in
            if (!user) {
                // Redirect to the login page or handle it in your application logic
                res.redirect('/');
                return;
            }
    
            console.log("user inside homepage is", user);
    
            const userId = user._id;
    
            console.log("userID in homepage is", userId);
    
            const categories = await Category.find();
            const totalProductsCount = await Product.countDocuments({ Display: "Active" });
    
            const totalPages = Math.ceil(totalProductsCount / limit);
            const skip = (page - 1) * limit;
    
            const products = await Product.find({ Display: "Active" })
                .skip(skip)
                .limit(limit)
                .populate('offer');
    
            const userCart = await Cart.findOne({ UserId: userId });
    
            const totalQuantity = userCart ? userCart.Items.reduce((acc, item) => acc + item.Quantity, 0) : 0;
    
            req.session.cartCount = totalQuantity;
    
            const cartCount = req.session.cartCount;
    
            console.log('user cart count is ', cartCount);
    
            res.render("user/homepage", {
                user,
                products,
                categories,
                currentPage: page,
                totalPages,
                cartCount
            });
        } catch (error) {
            console.error(error);
            
            res.status(500).render('error', { error: 'An error occurred' });
        }
    },
    


    shop: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 8;

            const categories = await Category.find();
            const totalProductsCount = await Product.countDocuments({ Display: "Active" })

            const totalPages = Math.ceil(totalProductsCount / limit);
            const skip = (page - 1) * limit;

            const products = await Product.find({ Display: "Active" })
                .skip(skip)
                .limit(limit)
                .populate('offer');
 
            const brands = await Brand.find();
            res.render("user/shop", {
                user: req.session.user,
                products,
                categories,
                currentPage: page,
                totalPages,
                brands,
            });
        } catch (error) {
            console.log(error);

            res.status(500).send("An error occurred");
        }
    },



    login: (req, res) => {
        res.render('user/login', { error: req.session.error, user: "" });
    },

    userLogin: async (req, res) => {
        try {

            const email = req.body.Email;
            const password = req.body.Password;


            const user = await User.findOne({ Email: email });

            console.log('login email', email);
            console.log('user:', user);


            if (user) {
                if (user.Status === "Active") {

                    const passwordMatch = await bcrypt.compare(password, user.Password);

                    console.log('Password:', password);
                    console.log('Password Match:', passwordMatch);


                    if (passwordMatch) {
                        const accessToken = jwt.sign(
                            { user: user._id },
                            process.env.ACCESS_TOKEN_SECRET,
                            { expiresIn: '1h' }
                        );

                        res.cookie('userJwt', accessToken, { maxAge: 60 * 60 * 1000 });


                        req.session.user = user;


                        return res.redirect('/homepage');
                    } else {

                        req.flash('error', 'Invalid username or password');
                        return res.redirect('/login');
                    }
                } else {

                    req.flash('error', 'User is Blocked');
                    return res.redirect('/login');
                }
            } else {

                req.flash('error', 'User Email is NOT Verified So please Verify With OTP');
                return res.redirect('/login');
            }
        } catch (error) {

            console.error(error);
            req.flash('error', 'An error occurred during login');
            res.redirect('/login');
        }
    },


    // signup: (req, res) => {
    //     const error = req.flash('error'); 
    //     res.render("user/signup", { err: error, user: '' });
    // },

    signup: (req, res) => {
        const referralCode = req.query.referralCode;
        console.log("Referral Code from URL:", referralCode);

        // Store the referralCode in the session
        req.session.referralCode = referralCode;

        const error = req.flash('error');
        res.render("user/signup", { err: error, user: '', referralCode: referralCode });
    },


    postUserSignup: async (req, res) => {
        try {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);

            const username = req.body.Username;
            const password = req.body.Password;
            const confirmPassword = req.body.confirmPassword;
            const referralCode = req.session.referralCode

            if (password && confirmPassword) {
                const hashedPassword = await bcrypt.hash(password, salt);
                const hashedConfirmPassword = await bcrypt.hash(confirmPassword, salt);

                // Log the hashed password and hashedConfirmPassword
                console.log('Hashed Password:', hashedPassword);
                console.log('Hashed Confirm Password:', hashedConfirmPassword);

                const email = req.body.Email;

                // req.session.user = {
                //     Username: username,
                //     Email: email,
                //     Password: hashedPassword
                // };
                req.session.user = {
                    Username: username,
                    Email: email,
                    Password: hashedPassword,
                    ReferralCode: referralCode  // Add the referral code to the session
                };

                const existingUser = await User.findOne({ Email: { $regex: new RegExp(email, 'i') } });

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

    // postEmailVerification: async (req, res) => {
    //     try {
    //         const userData = await User.create(req.session.user);
    //         if (userData) {
    //             const accessToken = jwt.sign(
    //                 { user: userData._id },
    //                 process.env.ACCESS_TOKEN_SECRET,
    //                 { expiresIn: 60 * 60 }
    //             );
    //             res.cookie("userjwt", accessToken, { maxAge: 60 * 1000 * 60 });
    //             res.json({
    //                 success: true,
    //                 user: req.session.user,
    //                 redirectUrl: '/login',
    //               });

    //         } else {
    //             req.flash("error", "Invalid Email Address");
    //             console.log("Invalid Email Address");
    //             res.redirect('/signup');
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         res.redirect('/signup');
    //     }
    // },


    postEmailVerification: async (req, res) => {
        try {
            const referralCode = req.session.referralCode

            console.log("referrer code is", referralCode);

            console.log("Before referrer search");

            const referrer = await User.findOne({ ReferralCode: referralCode });

            console.log("After referrer search");

            console.log("referrer here is", referrer);

            console.log("Before user creation");

            const userData = await User.create({
                ...req.session.user,
                ReferrerID: referrer ? referrer._id : null,
                ReferralCode: generateReferralCode(),
            });

            console.log("After user creation")

            if (referrer) {
                await Wallet.findOneAndUpdate(
                    { UserID: referrer._id },
                    { $inc: { Amount: 100 }, TransactionDate: new Date() },
                    { new: true }
                );

                // Update referrer's list of referrals with the new user
                await User.findOneAndUpdate(
                    { _id: referrer._id },
                    { $push: { Referrals: userData._id } },
                    { new: true }
                )
                await Wallet.create({
                    UserID: userData._id,
                    Amount: 100,
                });
            } else {
                await Wallet.create({
                    UserID: userData._id,
                    Amount: 0,
                });
            }
            if (userData) {
                const accessToken = jwt.sign(
                    { user: userData._id },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: 60 * 60 }
                );

                res.cookie("userjwt", accessToken, { maxAge: 60 * 1000 * 60 });

                res.json({
                    success: true,
                    user: req.session.user,
                    redirectUrl: '/login',
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
    searchByNames: async (req, res) => {
        try {
            const { searchNames } = req.query;

            console.log('Search names:', searchNames);

            const products = await Product.find().populate('offer');

            const filteredProducts = products.filter(product => {
                const productName = product.ProductName.trim().toLowerCase()
                return searchNames.split(',').some(searchName => productName.includes(searchName.trim().toLowerCase()));
            });

            console.log("filtered products:", filteredProducts);

            res.render('user/searchResults', { user: req.session.user ?? null, products: filteredProducts});

        } catch (error) {
            console.log(error);
        }
    },


    // ---------------------addtocart------------------------------------------------------------------------------


    addtocart: async (req, res) => {
        try {
            const { user } = req.session;

            
            if (!user || !user.user) {
                return res.status(400).json({ success: false, error: "Invalid user session" });
            }

            const userId = user.user;
            const productId = req.params.productId;

            let usercart = await Cart.findOne({ UserId: userId });

            if (!usercart) {
                // If the cart doesn't exist, create a new one
                usercart = new Cart({
                    UserId: userId,
                    Items: [{ ProductId: productId, Quantity: 1 }],
                });

                await usercart.save();
            } else {
                // If the cart exists, find the product in the cart
                const existingItem = usercart.Items.find(item => item.ProductId.equals(productId));

                if (existingItem) {
                    // If the product exists, increment the quantity
                    existingItem.Quantity += 1;
                } else {
                    // If the product doesn't exist, add a new item to the cart
                    usercart.Items.push({ ProductId: productId, Quantity: 1 });
                }

                await usercart.save();
            }

            const success = true; 
            const message = success ? 'Item added to the cart' : 'Failed to add item to the cart';
             res.json({ success, message });
            
        } catch (error) {
            console.error("Error in addtocart:", error);

            // Handle different error scenarios
            if (error.name === 'ValidationError') {
                res.status(400).json({ success: false, error: "Validation error" });
            } else {
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        }
    },





    // --------------------------------cartpage----------------------------------------------------------------


    getCartpage: async (req, res) => {
        try {
            const userId = req.session.user.user;
            console.log("user id is to get page here ", userId);

            const user = await User.findById(userId);
            console.log("after finding the user is", user);

            const cart = await Cart.findOne({ UserId: userId }).populate("Items.ProductId").populate("coupon");
            console.log("cart in getCartpage:", cart);

            const coupons = await Coupon.find();
            // if (!user || !cart) {
            //     return res.status(404).send("User or cart not found");
            // }
            if (!user) {

                return res.redirect("/login");
            }

            // if (!cart) {

            //     return res.render("user/cartpage", { user, cart, coupons });
            // }
          
            const userCart = await Cart.findOne({ UserId: userId });
            
            const totalQuantity = userCart ? userCart.Items.reduce((acc, item) => acc + item.Quantity, 0) : 0;
 
             req.session.cartCount=totalQuantity;
 
             const cartCount=req.session.cartCount
 
             console.log('user cart count is ',cartCount);

            res.render("user/cartpage", { user, cart, coupons, cartCount });
            
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
            const coupon = req.session?.temporaryCouponInfo?.discount;

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
            res.json({ message: "Quantity Updated Successfully", newQuantity, coupon })
        } catch (error) {
            console.error("Error updating quantity:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },


    // -------------------------------remove from cart----------------------------------------------------------------



    removeItemFromCart: async (req, res) => {

        const userId = req.session.user.user;

        const user = await User.findById(userId);

        console.log("user for delete is user", user);

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
        try {
            const userId = req.session.user.user;
            const user = await User.findById(userId).populate('Referrals').populate('ReferrerID');

            if (!user) {
                return res.status(404).send('User not found');
            }

            // Construct the referral link
            const referralLink = `https://totetreasureshub.shop/signup?referralCode=${user.ReferralCode}`;
      
            res.render("user/userprofile", {
                user,
                referralLink,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
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
        try {
            const userId = req.session.user.user;
    
            const user = await User.findById(userId);
    
            const page = parseInt(req.query.page) || 1;
            const limit = 8;
    
            const totalOrderCount = await Order.countDocuments({ UserId: userId });
    
            const totalPages = Math.ceil(totalOrderCount / limit);
            const skip = (page - 1) * limit;
    
            
            const orders = await Order.find({ UserId: userId })
                .sort({ OrderDate: -1 })  
                .skip(skip)
                .limit(limit);
    
            res.render("user/orderlist", { 
                user, 
                order: orders,  // Use the sorted orders
                currentPage: page,
                totalPages
            });
        } catch (error) {
            console.error(error);
            // Render the error page with the error information
            res.render("errorpage", { error: "Internal Server Error" });
        }
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
            res.render("errorpage", { error: "Internal Server Error" });
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
        try {
            console.log("reached here for postcheckout ", req.body);

            const PaymentMethod = req.body.paymentMethod;

            console.log("payment method is", PaymentMethod);

            const Address = req.body.Address;
            const userId = req.session.user.user;
            const amount = req.session.totalPrice;

            console.log("address before checkout is", Address);

            const user = await User.findById(userId);

            const Email = user.Email;

            const cart = await Cart.findOne({ UserId: userId }).populate("Items.ProductId");

            if (!cart || cart.Items.length === 0) {
                console.log('Cart is null or empty.');
                return res.status(400).json({ cartEmpty: true });
            }

            console.log("total price before checkout is :", req.session.totalPrice);

            const addressData = await User.findOne(
                {
                    _id: userId,
                },
                {
                    Address: {
                        $elemMatch: { _id: new mongoose.Types.ObjectId(Address) },
                    },
                }
            );

            console.log("address is selected for checkout is : ", addressData.Address[0].AddressLane);

            if (addressData && addressData.Address) {
                const add = {
                    Name: addressData.Address[0].Name,
                    Address: addressData.Address[0].AddressLane,
                    Pincode: addressData.Address[0].Pincode.toString(),
                    City: addressData.Address[0].City,
                    State: addressData.Address[0].State,
                    Mobile: addressData.Address[0].Mobile,
                };
                console.log("add is here", add);

                const currentDate = new Date();
                const fourDaysFromNow = new Date(currentDate);
                fourDaysFromNow.setDate(currentDate.getDate() + 4);
                const deliveryDate = fourDaysFromNow.toLocaleDateString();

                const newOrders = new Order({
                    UserId: userId,
                    Items: cart.Items,
                    OrderDate: currentDate,
                    deliveryDate,
                    TotalPrice: amount,
                    Address: add,
                    PaymentMethod: PaymentMethod,
                });

                await Cart.findByIdAndDelete(cart._id);

                console.log("delivery date is ", fourDaysFromNow);

                console.log("new order which is saved is ", newOrders);

                req.session.orderId = newOrders._id;

                // ---------------------------------------------stock modifying-----------------------------------------------

                for (const item of newOrders.Items) {
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

                // -------------------------------------------Save Coupon Information ------------------------------------------

                if (req.session.temporaryCouponInfo) {
                    const { couponCode } = req.session.temporaryCouponInfo;
                    const couponData = await Coupon.findById(couponCode);

                    console.log("coupon data inside the postcheckout ", couponData);

                    if (couponData) {
                        // Check if the coupon is still valid
                        if (currentDate >= couponData.startDate && currentDate <= couponData.expiration_date) {
                            couponData.usedBy.push({
                                userId: userId,
                                couponCode: couponCode,
                            });

                            await couponData.save();

                            // Remove the temporary coupon info from the session after successful application
                            delete req.session.temporaryCouponInfo;
                        } else {
                            console.error('Coupon has expired.');
                            res.status(400).json({ error: 'Coupon has expired.' });
                            return; // Exit the function if the coupon has expired
                        }
                    } else {
                        console.error('Coupon not found.');
                        res.status(404).json({ error: 'Coupon not found.' });
                        return; // Exit the function if the coupon is not found
                    }
                }

                // -------------------------------------------COD------MAIL SENDING ------------------------------------------------------

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
                            `Hello! ${user.Username} Your order has been received and will be processed within ${deliveryDate}` +
                            ` your total price is ${req.session.totalPrice}`,
                    };

                    transporter.sendMail(mailData, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log("Success");
                    });

                    await newOrders.save();

                    res.json({ codSuccess: true });

                } else if (PaymentMethod === "online") {
                    const order = {
                        amount: amount,
                        currency: "INR",
                        receipt: req.session.orderId,
                    };

                    try {
                        const createdOrder = await razorpay.createRazorpayOrder(order);
                        console.log("payment response", createdOrder);
                        newOrders.razorpayOrderId = createdOrder.id;
                        await newOrders.save();
                        res.json({ onlineSuccess: true, createdOrder, order });
                    } catch (err) {
                        console.log(err);
                        await Cart.findByIdAndDelete(cart._id);
                        res.json({ onlineSuccess: false, error: "Razorpay order creation failed" });
                    }

                } else if (PaymentMethod === "wallet") {

                    const user = await User.findById(userId);
                    const wallet = await Wallet.findOne({ UserID: user });

                    console.log("Wallet is here ", wallet);

                    if (wallet) {

                        let walletAmount = wallet.Amount;

                        console.log("wallet amount availabile is ", walletAmount);

                        if (walletAmount >= amount) {

                            walletAmount = walletAmount - amount;

                            wallet.Amount = walletAmount;
                            await wallet.save();

                            console.log("wallet amount after decucting is ", walletAmount)
                            // Send an email to the user about the order and updated wallet balance
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
                                    `Hello! ${user.Username}, Your order has been received and will be processed within ${deliveryDate}` +
                                    ` Your total price is ${amount}. Your wallet balance is now ${walletAmount}.`,
                            };

                            transporter.sendMail(mailData, (error, info) => {
                                if (error) {
                                    return console.log(error);
                                }
                                console.log("Success");
                            });

                            newOrders.OrderDate = new Date();
                            newOrders.TotalPrice = amount;
                            newOrders.PaymentStatus = "Paid";
                            newOrders.PaymentMethod = "wallet";
                            await newOrders.save();

                            res.json({ walletSuccess: true });
                        } else {
                            if (req.session.temporaryCouponInfo) {
                                delete req.session.temporaryCouponInfo;
                            }
                            res.json({ walletSuccess: false, error: "Insufficient funds in the wallet" });
                        }
                    } else {
                        if (req.session.temporaryCouponInfo) {
                            delete req.session.temporaryCouponInfo;
                        }
                        res.json({ walletSuccess: false, error: "Wallet not found for the user" });
                    }
                }

            } else {
                console.error('Address data not found.');
            }
        } catch (error) {
            console.log(error);

            // Remove the temporary coupon info from the session in case of an error
            delete req.session.temporaryCouponInfo;

            res.json({ error: "Some error occurred" });
        }
    },


    // -----------------------------------------------END-----------------------------------------------------------------------------------






    // ------------------------------------------------------verifyPayment-------------------------------------------------------------------

    verifyPayment: async (req, res) => {
        console.log("Verify payment body inside:", req.body);

        try {
            const hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body.payment;

            hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
            const calculatedHmac = hmac.digest("hex");

            console.log('Calculated HMAC:', calculatedHmac);
            console.log('Received Signature:', razorpay_signature);

            if (calculatedHmac === razorpay_signature) {
                const orderId = req.session.orderId;

                console.log('Order ID from session:', orderId);

                if (!mongoose.Types.ObjectId.isValid(orderId)) {
                    console.error('Invalid order ID format.');
                    return res.status(400).json({ error: 'Invalid order ID format.' });
                }

                const order = await Order.findById(orderId);

                if (!order) {
                    console.error('Order not found.');
                    return res.status(404).json({ error: 'Order not found.' });
                }

                // Update order details
                order.PaymentStatus = "Paid";
                order.PaymentMethod = "Online";

                // Save the updated order
                await order.save();

                if (req.session.temporaryCouponInfo) {
                    delete req.session.temporaryCouponInfo;
                }

                console.log("HMAC verification success");
                return res.json({ success: true });
            } else {
                console.log("HMAC verification failed");
                return res.json({ failure: true });
            }
        } catch (error) {
            console.error('An error occurred:', error);
            return res.status(500).json({ error: 'An error occurred.' });
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

    // ------------------------------------------------download invoice------------------------------------------------------------------------------------

    downloadInvoice: async (req, res) => {

        try {
            const orderData = await Order.findOne({
                _id: req.body.orderId,
            })
                .populate("Address")
                .populate('Items.ProductId');

            const status = orderData.Status;
            const paymentMethod = orderData.PaymentMethod;

            console.log('oderdata for download is ', orderData);

            const filePath = await invoice.order(orderData, status, paymentMethod)

            console.log('file path here is for download is  ', filePath);

            const orderId = orderData._id;

            res.json({ orderId });

        } catch (error) {
            console.error("Error in downloadInvoice:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },


    downloadfile: async (req, res) => {

        const id = req.params._id;
        
        const filePath = path.join(__dirname,'..', 'public', 'pdf', `${id}.pdf`);
      
        // Send the file as a response
        res.download(filePath, `invoice.pdf`, (err) => {
          if (err) {
            console.error(`Error sending file: ${err}`);
            res.status(500).send('Internal Server Error');
          }
        });
      },

    // ----------------------------------------------------------Retrun the order----------------------------------------------------

    returnOrder: async (req, res) => {
        const orderId = req.params._id;
        const reason = req.body.returnReason;

        try {
            console.log("Reason for return is:", reason);

            const order = await Order.findOneAndUpdate(
                { _id: orderId },
                { $set: { Status: 'Return Pending', ReturnReason: reason } },
                { new: true }
            );

            if (!order) {
                return res.status(200).json({ message: "Order not found" });
            }

            console.log("Return order status:", order.Status);

            return res.status(200).json({
                message: "Return requested successfully",
                order: order, // Include the updated order in the response
            });
        } catch (error) {
            console.error('Error Requesting return:', error.message);
            return res.status(500).json({ error: "Error requesting return" });
        }
    },



    CancelreturnOrder: async (req, res) => {
        const orderId = req.params._id;

        try {
            const order = await Order.findOneAndUpdate(
                { _id: orderId },
                { $set: { Status: "Delivered", ReturnReason: null } },
                { new: true }
            );

            if (!order) {
                return res.status(404).json({ error: "Order not found" });
            }

            // Send a JSON response indicating success
            return res.status(200).json({ message: "Return request canceled successfully" });
        } catch (error) {
            console.error("Error canceling return request:", error);
            return res.status(500).json({ error: "Error canceling return request" });
        }

    },
    // -----------------------------------------------------user logout-------------------------------------------------


    getUserLogout: (req, res) => {
        req.session.user = false;
        res.clearCookie("userJwt");
        res.redirect("/login");
    },

};

