const express=require('express')
const router=express.Router()
const userController=require('../controllers/userController')
const Product=require('../models/productSchema')
const userAuth=require('../middlewares/userAuth')
const { userSignupValidation, validate } = require('../middlewares/signupvalidation'); // Import your validation middleware
const {passwordValidation,confirmPasswordValidation,passvalidate,} = require('../middlewares/newpasswordvalidate');

router.route('/')
.get(userController.initial)

router.route('/homepage')
.get(userController.home)

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
.post( userAuth.userExist, // Ensure user exists
passwordValidation, // Apply password validation middleware
confirmPasswordValidation, // Apply confirmPassword validation middleware
passvalidate, // Apply the validation results check middleware
  userController.postCreateNewPassword)

// router.route('/signup')
// .get(userController.signup)
// .post(userController.postUserSignup)
router.route('/signup')
  .get(userAuth.userExist,userController.signup)
  .post(
    userSignupValidation, // Apply the validation middleware here
    validate, // Apply the validation function here
    userController.postUserSignup // Handle the signup post request
  );

router.route('/emailVerification')
.get(userAuth.userExist,userController.getemailVerification)
.post(userController.otpAuth,userController.postEmailVerification)

router.route('/resendOtp')
.get(userAuth.userExist,userController.resendOtp)
.post(userController.otpAuth)

router.route('/productViewDetailspage/:id')
.get(userAuth.userTokenAuth,userController.getproductViewDetailspage)

// -----------------------------------cart-----------------------------------------------------------------

router.route('/cartpage')
.get(userAuth.userTokenAuth,userController.getCartpage)


router.route('/addtocart/:_id')
.get(userAuth.userTokenAuth,userController.addtocart)


router.route('/updateQuantity')
.post(userAuth.userTokenAuth,userController.updateQuantity)


router.route('/removefromcart/:_id')
.get(userAuth.userTokenAuth,userController.removeItemFromCart)



// -----------------------------------------------------User Profile-------------------------------------------

router.route('/profile')
.get(userAuth.userTokenAuth,userController.profile)

router.route('/addAddress')
.post(userAuth.userTokenAuth, userController.postAddressForm)


router.route('/editAddress')
.get(userAuth.userTokenAuth,userController.getEditAddress)

router.route('/editAddress/:_id')
.post(userAuth.userTokenAuth,userController.postEditAddress)

router.route('/deleteAddress/:_id')
.get(userAuth.userTokenAuth,userController.deleteAddress)








// -----------------------------------------------logout-------------------------------------------------------

router.route('/logout')
.get(userController.getUserLogout)

module.exports=router;