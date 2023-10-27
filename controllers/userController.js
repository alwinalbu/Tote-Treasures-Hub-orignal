const User = require('../models/userSchema')
const Category=require('../models/categorySchema')
const Product=require('../models/productSchema')
const Brand=require('../models/brandSchema')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const flash = require("express-flash")
const crypto = require("crypto")
const otpFunctions = require('../utility/otpFunctions')
const OTP = require('../models/otpSchema')
const session = require('express-session');
module.exports = {
    initial: async (req, res) => {
        try {
            const categories = await Category.find();
            const products = await Product.find({ Display: "Active" })
            res.render("user/landingpage", {user:'',products,categories});
        } catch (error) {
            console.log(error);
        }
    },

    
    home: async (req, res) => {
        try {
            const categories = await Category.find();
            const products = await Product.find({ Display: "Active" })
            res.render("user/homepage", {user: req.session.user,products,categories});
        } catch (error) {
            console.log(error);
        }
    },

    login: (req, res) => {
        res.render('./user/login', { error: req.session.error,user: req.session.user });
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
            if (user && user.Status === "Active") {
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
                // If no user is found or user's status is not "Active," show an error and redirect to the login page.
                req.flash('error', 'Blocked Invalid username or password');
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
        res.render("user/signup", { err: error, user:'' });
      },
      
    // postUserSignup: async (req, res) => {
    //     try {
    //         const saltRounds = 10;
    //         const salt = await bcrypt.genSalt(saltRounds);
    
    //         const username = req.body.Username; // Capture the user's username
    //         const password = req.body.Password;
    //         const confirmPassword = req.body.confirmPassword;
    
    //         if (password && confirmPassword) {
    //             // Hash the password using bcrypt
    //             const hashedPassword = await bcrypt.hash(password, salt);
    //             const hashedConfirmPassword = await bcrypt.hash(confirmPassword, salt);
    
    //             // Log the hashed password and hashedConfirmPassword
    //             console.log('Hashed Password:', hashedPassword);
    //             console.log('Hashed Confirm Password:', hashedConfirmPassword);
    
    //             const email = req.body.Email;
    
    //             const emailRegex = /^([a-zA-Z0-9\._]+)@([a-zA-Z0-9]+)\.([a-z]+)(\.[a-z]+)?/;
    
    //             // Testing the email
    //             const isValidEmail = emailRegex.test(email);
    
    //             if (isValidEmail) {
    //                 req.session.user = {
    //                     Username: username,
    //                     Email: email,
    //                     Password:hashedPassword
    //                 };
    //                 const existingUser = await User.findOne({ Email: email });
    
    //                 if (existingUser) {
    //                     req.flash("error", "Email already exists");
    //                     console.log("Email already there");
    //                     res.redirect("/signup");
    //                 } else {
    //                     otpToBeSent = otpFunctions.generateOTP();
    //                     const result = otpFunctions.sendOTP(req, res, email, otpToBeSent);
    //                 }
    //             } else {
    //                 req.flash("error", "Invalid email address");
    //                 res.redirect('/signup');
    //                 console.log("Invalid email address");
    //             }
    
    //             // Compare the hashed password and hashedConfirmPassword
    //             if (hashedPassword === hashedConfirmPassword) {
    //                 console.log('Password and ConfirmPassword match.');
    //             } else {
    //                 console.log('Password and ConfirmPassword do not match.');
    //             }
    //         } else {
    //             req.flash("error", "Passwords are missing");
    //             res.redirect("/signup");
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         req.flash("error", "An error occurred during signup.");
    //         res.redirect("/signup");
    //     }
    // }, 

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
            res.render("user/emailVerification", { messages: req.flash(),user:'' });
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
                res.json({ success: true })

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
            messages: req.flash(),user: req.session.user});
    },
    postforgotpassword: async (req, res) => {
        try {
            req.session.Email = req.body.Email;
            const Email = req.body.Email;
            console.log("1223",Email)
            const userData = await User.findOne({ Email: Email });
            if (userData) {
                otpToBeSent = otpFunctions.generateOTP();
                const result = otpFunctions.passwordsendOTP(req, res, Email, otpToBeSent);

            } else {
                req.flash("error", "Email Not Registesred");
                res.redirect("/otpVerification")
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
            console.log("resend email is ",Email);
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
            console.log("this is new eamil",Email);
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
            res.render("user/otpVerification", { messages: req.flash(),user: req.session.user });
        } catch (error) {
            console.log(error);
            res.redirect("/login");
        }
    },
    passwordOtpAuth: async (req, res,next) => {
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
        res.render('user/changePassword',{ messages: req.flash(),user: req.session.user })
    },

    postCreateNewPassword: async (req, res) => {
        try {
            const user = await User.findOne({ Email: req.session.Email })
            if (req.body.Password === req.body.confirmPassword) {
                const hashedPassword = await bcrypt.hash(req.body.Password, 8);
                const updatedUser = await User.updateOne({ _id: user._id },{ $set: { Password: hashedPassword } });
                console.log(hashedPassword);
                if(!updatedUser){
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

            } else {
                req.flash("error", "Passwords do not match!");
                res.redirect('/createNewPassword');
            }
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
          product: product,
          categories,
          brands,
          user: req.session.user,
        });
    },
    























 
    getUserLogout: (req, res) => {
        req.session.user = false;
        res.clearCookie("userJwt");
        res.redirect("/login");
    },

};

