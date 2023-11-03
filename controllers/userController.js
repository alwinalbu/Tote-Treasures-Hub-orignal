const User = require('../models/userSchema')
const Category = require('../models/categorySchema')
const Product = require('../models/productSchema')
const Brand = require('../models/brandSchema')
const Cart = require("../models/cartSchema")
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
            res.render("user/landingpage", { user: '', products, categories });
        } catch (error) {
            console.log(error);
        }
    },


    home: async (req, res) => {
        try {
            const categories = await Category.find();
            const products = await Product.find({ Display: "Active" })
            res.render("user/homepage", { user: req.session.user, products, categories });
        } catch (error) {
            console.log(error);
        }
    },

    login: (req, res) => {
        res.render('user/login', { error: req.session.error, user: req.session.user });
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
            product: product,
            categories,
            brands,
            user: req.session.user,
        });
    },





    // ---------------------addtocart---------------------------


    addtocart: async (req, res) => {
        console.log("user session user is ", req.session.user);
        const userid = req.session.user.user;
        console.log("userid is:", userid);
        const productid = req.params._id;
        console.log("product id is ",productid);
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




    // --------------------------------cartpage---------------------------------------


    getCartpage: async (req, res) => {

        const userId = req.session.user.user;

        console.log("user id is to get page here ",userId)

        const user = await User.findById(userId);

        console.log("after finding the user is", user);

        const cart = await Cart.findOne({ UserId: userId }).populate(
            "Items.ProductId"
        );

        console.log("cart before getcartpage :", cart);

        res.render("user/cartpage", { user, cart });
    },

// ----------------------------------------------update Quantity -------------------------------------------------
updateQuantity:async(req,res)=>{
    try {
        const { productId,change }=req.body;

        const userId=req.session.user.user;

        console.log("update side userid",userId)

        const usercart=await Cart.findOne({UserId:userId});
        const product=await Product.findById(productId);

        console.log("usercart is here",usercart);
        console.log("product is here",product)

        if(!usercart || !product){
            return res.status(404).json({error:"Product or Cart cannot be Found "})
        };
        const cartItem=usercart.Items.find((item)=>
         item.ProductId.equals(productId)
        );

        const newQuantity=cartItem.Quantity+parseInt(change);
        if(newQuantity<1){
            usercart.Items=ProductId.Items.filter((item)=>!item.ProductId.equals(productId)); 
        }else {
            cartItem.Quantity=newQuantity;
        }

        await usercart.save();
        res.json({message:"Quantity Updated Successfully",newQuantity}) 
    } catch (error) {
        console.error("Error updating quantity:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
},


// -------------------------------remove from cart----------------------------------------------------------------



removeItemFromCart: async (req, res) => {

const userId=req.session.user.user;

const user=await User.findById(userId);

const productId=req.params._id;

const updateCart=await Cart.findOneAndUpdate({UserId:user},
    {$pull:{Items:{ProductId:productId}}},
    {new:true}
    );
    console.log(" cart after deletion :",updateCart);
    
    res.redirect("/cartpage")

},


// --------------------------------------------User Profile------------------------------------------

profile: async (req, res) => {
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    // const orderCount = await Order.countDocuments({ UserId: userId });
    // const cartCount = await Cart.countDocuments({ UserId: userId });
    // const addressCount = await User.countDocuments();
    console.log(req.session.user);
    res.render("user/userprofile", {
      user,
    //   orderCount,
    //   cartCount,
    //   addressCount,
    });
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
    console.log("Adress which got added is this ",address);
    req.flash("success", "Address Added successfully");
    res.redirect("/editAddress");
    
  },

// ------------------------------------------------edit address-------------------------------------------------

postEditAddress: async(req,res)=>{
 
    const addressId=req.params._id;

    const userId=req.session.user.user;

    console.log("user id is ",userId);

    const user=await User.findById(userId)

    try {
        if (user) {

            const {Name,AddressLane,City,State,Pincode,Mobile}=req.body

            const addressIndex=user.Address.findIndex((a)=>a._id.toString()===addressId);

            if(addressIndex!==-1){

                user.Address[addressIndex].Name=Name;
                user.Address[addressIndex].AddressLane = AddressLane;
                user.Address[addressIndex].City = City;
                user.Address[addressIndex].State = State;
                user.Address[addressIndex].Pincode = Pincode;
                user.Address[addressIndex].Mobile = Mobile;

                await user.save();
            

                console.log("Address updated successfully");
                req.flash("success", "Address updated successfully");
                res.redirect("/editAddress");

            }else{
                console.log("Address Not Found")
                req.flash("error","Address Not Found")
                res.redirect("/editAddress");
            }
            
        } else {
            req.flash("error","User Not Found")
            res.redirect("/editAddress");
        }
        
    } catch (error) {
       req.flash("error","Error In Updating Address")
       res.redirect("/editAddress");
    }

},

// -----------------------------------------delete the address--------------------------------------------------------


deleteAddress: async (req, res) => {
    console.log('test');
    const userId = req.session.user.user;
    const addressId = req.params._id; // Assuming you receive the address ID to delete from the request parameters
  
    console.log("address id is to delete",addressId)
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
  











// -----------------------------------------------------user logout-------------------------------------------------



    getUserLogout: (req, res) => {
        req.session.user = false;
        res.clearCookie("userJwt");
        res.redirect("/login");
    },

};

