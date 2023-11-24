const express=require('express')
const router=express.Router()
const userController=require('../controllers/userController')
const wishlisitController=require('../controllers/wishlistController')
const Product=require('../models/productSchema')
const userAuth=require('../middlewares/userAuth')
const { userSignupValidation, validate } = require('../middlewares/signupvalidation'); // Import your validation middleware
const {passwordValidation,confirmPasswordValidation,passvalidate,} = require('../middlewares/newpasswordvalidate');
const cartController=require("../controllers/cartController")
const Categories = require('../models/categorySchema')
const passport = require('passport');
const { sign } = require('crypto')



router.route('/')
.get(userController.initial)

// ---------------------------------------google sign in----------------------------------------------------

// Route to initiate Google Sign-In
router.get('/auth/google', userController.googleSignIn);
router.get('/auth/google/callback', userController.googleSignInCallback);

// ------------------------------------------------------------------------------------------------------------
router.route('/homepage')
.get(userController.home)

router.route('/shop')
.get(userController.shop)


router.route('/login')
.get(userAuth.userExist,userController.login)
.post(userController.userLogin)

router.route('/forgotpassword')
.get(userAuth.userExist,userController.forgotpassword)
.post(userController.postforgotpassword)

router.route('/otpVerification')
.get(userAuth.userExist,userController.getOtpVerification)
.post(userController.passwordOtpAuth,userController.postOtpVerification)

router.route('/passwordResendOtp')
.get(userAuth.userExist,userController.PasswordResendOtp)

router.route('/createNewPassword')
.get(userAuth.userExist,userController.getCreateNewPassword)
.post( userAuth.userExist,passwordValidation,confirmPasswordValidation,passvalidate,userController.postCreateNewPassword)



router.route('/signup')
  .get(userAuth.userExist, userController.signup)
  .post(
    (req, res, next) => {
      console.log('Validation middleware triggered'); // Add a log to check if the validation middleware is being executed
      next();
    },
    userSignupValidation,
    validate,
    (req, res, next) => {
      console.log('Post signup handler triggered'); 
      userController.postUserSignup(req, res, next);
    }
  );

router.route('/emailVerification')
.get(userAuth.userExist,userController.getemailVerification)
.post(userController.otpAuth,userController.postEmailVerification)

router.route('/resendOtp')
.get(userAuth.userExist,userController.resendOtp)
.post(userController.otpAuth)

// --------------------------------------------Search----------------------------------------------------------------

router.route('/search')
.get(userAuth.userExist,userController.searchByTags)






// -----------------------------------------Categories Select------------------------------------------------------

// router.route('/category/:_id')
// .get(userAuth.userExist,userController.CategoriesSelect)



router.route('/productViewDetailspage/:id')
.get(userController.getproductViewDetailspage)


// ------------------------------------------------Wishlist--------------------------------------------------------

router.route('/wishlist')
.get(userAuth.userTokenAuth,wishlisitController.getWishList)

router.route('/addToWishlist/:_id')
.get(userAuth.userTokenAuth,wishlisitController.addToWishList)


router.route('/removefromWishlist/:_id')
.get(userAuth.userTokenAuth,wishlisitController.removeItemFromWishlist)


// -----------------------------------cart-----------------------------------------------------------------

router.route('/cartpage')
.get(userAuth.userTokenAuth,userController.getCartpage)
.post(userAuth.userTokenAuth,userController.postCart)


router.route('/addtocart/:_id')
.get(userAuth.userTokenAuth,userController.addtocart)


router.route('/updateQuantity')
.post(userAuth.userTokenAuth,userController.updateQuantity)


router.route('/removefromcart/:_id')
.get(userAuth.userTokenAuth,userController.removeItemFromCart)


router.route('/checkStock')
.get(userAuth.userTokenAuth, cartController.checkStock)


// -------------------------------------------checkout page----------------------------------------------------

router.route('/checkout')
.get(userAuth.userTokenAuth,userController.getCheckout)
.post(userAuth.userTokenAuth,userController.postCheckout)


router.route('/verify-payment')
.post(userAuth.userTokenAuth, userController.verifyPayment);


router.route('/addAddressCheckout')
.post(userAuth.userTokenAuth,userController.addAddressCheckout)


router.route('/orderSuccess')
.get(userAuth.userTokenAuth,userController.getOrderSucces)


// -----------------------------------------------------User Profile-------------------------------------------

router.route('/profile')
.get(userAuth.userTokenAuth,userController.profile)

router.route('/changepassword')
.post(userAuth.userTokenAuth,passwordValidation,confirmPasswordValidation,passvalidate,userController.changePassword)


router.route('/addAddress')
.post(userAuth.userTokenAuth, userController.postAddressForm)


router.route('/editAddress')
.get(userAuth.userTokenAuth,userController.getEditAddress)


router.route('/editAddress/:_id')
.post(userAuth.userTokenAuth,userController.postEditAddress)


router.route('/deleteAddress/:_id')
.get(userAuth.userTokenAuth,userController.deleteAddress)

router.route('/orderlist')
.get(userAuth.userTokenAuth,userController.getOrderlist)


router.route('/order/details/:_id')
.get(userAuth.userTokenAuth,userController.getOrderDetails)

router.route('/order/cancelorder/:_id')
.post(userAuth.userTokenAuth, userController.cancelOrder);

router.route('/order/return/:_id')
.post(userAuth.userTokenAuth, userController.returnOrder);

router.route('/order/cancelRequest/:_id')
.post(userAuth.userTokenAuth, userController.CancelreturnOrder);


// ---------------------------------------download invoice of order for user ----------------------------------------------------------------

router.route('/download-invoice')
.post(userAuth.userTokenAuth,userController.downloadInvoice)


router.route('/download-invoice/:_id')
.get(userAuth.userTokenAuth,userController.downloadfile)


// -----------------------------------------------logout-------------------------------------------------------------------------------------

router.route('/logout')
.get(userController.getUserLogout)

module.exports=router;