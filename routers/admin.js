const express = require('express')
const router = express.Router()
const adminController=require('../controllers/adminController')
const brandController=require("../controllers/brandController")
const categoryController=require("../controllers/categoryController")
const productController=require("../controllers/productController")
const orderController=require("../controllers/orderController")
const couponController=require('../controllers/couponController')
const offferController=require('../controllers/offferController')
const upload = require('../middlewares/upload')
const adminAuth=require('../middlewares/adminAuth')
const Categories = require('../models/categorySchema')



router.route("/")
    .get(adminAuth.adminExist,adminController.initial)

router.route('/Login')
    .get(adminAuth.adminExist,adminController.getLogin)
    .post(adminController.postLogin)

// ---------------------------------------------------------------------------------------------------------------

router.route("/dashboard")
.get(adminAuth.adminTokenAuth,adminController.getDashboard)

router.route('/count-orders-by-day')
 .get(adminAuth.adminTokenAuth,adminController.getCount)
router.route('/count-orders-by-month')
.get(adminAuth.adminTokenAuth,adminController.getCount)
router.route('/count-orders-by-year')
.get(adminAuth.adminTokenAuth,adminController.getCount)


router.route('/daily')
.get(adminAuth.adminTokenAuth,adminController.getBestSellingProducts)


router.route('/monthly')
.get(adminAuth.adminTokenAuth,adminController.getMonthlyBestSellingProducts)


router.route('/yearly')
.get(adminAuth.adminTokenAuth,adminController.getYearlyBestSellingProducts)


router.route('/downloadsalesreport')
.post(adminAuth.adminTokenAuth,orderController.getDownloadSalesReport)



// --------------------------Userlist----------------------------------

router.route('/userslist')
    .get(adminAuth.adminTokenAuth,adminController.getUser)

router.route('/userlist/:_id')
    .get(adminAuth.adminTokenAuth,adminController.blockUser)


// --------------------------------Brand-----------------------------

 router.route("/addbrand")
.get(adminAuth.adminTokenAuth,brandController.getAddBrand)
.post(brandController.postAddBrand)

router.route('/brandpage')
.get(adminAuth.adminTokenAuth,brandController.getbrandpage)


router.route("/editBrand/:_id")
.get(adminAuth.adminTokenAuth,brandController.getEditBrand)
.post(brandController.postEditBrand)


router.route('/deleteBrand/:id')
.get(adminAuth.adminTokenAuth,brandController.deleteBrand)

// ------------------------Categories------------------------------

router.route('/Categorypage')
.get(adminAuth.adminTokenAuth,categoryController.getCategory)

router.route('/addcategory')
.get(adminAuth.adminTokenAuth,categoryController.getAddCategory)
.post(upload.single('image'),categoryController.postAddCategory)


router.route("/editCategory/:_id")
.get(adminAuth.adminTokenAuth,categoryController.getEditCategory)
.post(upload.single('image'),categoryController.postEditCategory)



router.route('/deleteCategory/:id')
.get(adminAuth.adminTokenAuth,categoryController.deleteCategory)

// -------------------------------product-----------------------------------------------------

router.route("/product")
.get(adminAuth.adminTokenAuth,productController.getProduct)

router.route("/addproduct")
.get(adminAuth.adminTokenAuth,productController.getAddProduct)
.post(upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }]),productController.postAddProduct)

router.route('/product/:_id')
.get(adminAuth.adminTokenAuth,productController.blockProduct)

router.route('/viewproductdetails/:_id')
.get(adminAuth.adminTokenAuth,productController.getviewProductDetails)

router.route('/editproduct/:_id')
.get(adminAuth.adminTokenAuth,productController.getEditProduct)
.post(upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }]),productController.postEditProduct)


// -----------------------------------------------Order----------------------------------------------------------------

router.route("/order")
.get(adminAuth.adminTokenAuth,orderController.getOrders)

router.route('/order/details/:_id')
.get(adminAuth.adminTokenAuth,orderController.getOrderDetails)


router.route('/order/updatestatus/:orderId')
.put(adminAuth.adminTokenAuth,orderController.changeStatus)


router.route('/orders/acceptReturn/:orderId')
.put(adminAuth.adminTokenAuth,orderController.acceptReturn)

router.route('/orders/cancelReturn/:orderId')
.put(adminAuth.adminTokenAuth,orderController.cancelReturn)

// ----------------------------------------------------Coupon------------------------------------------------------

router.route('/coupons')
.get(adminAuth.adminTokenAuth,couponController.getCoupon)

router.route('/addCoupon')
.post(adminAuth.adminTokenAuth,couponController.AddCoupon)

// router.route('/updateCoupon')
// .put(adminAuth.adminTokenAuth,couponController.UpdateCoupon)

// router.route('/deleteCoupon/:couponId')
// .delete(adminAuth.adminTokenAuth,couponController.DeleteCoupon)


// ----------------------------------------------------Offers---------------------------------------------------------

router.route('/offers')
.get(adminAuth.adminTokenAuth,offferController.getOffers)

router.route('/addOffer')
.post(adminAuth.adminTokenAuth,offferController.addOffers)




// ----------------------logout--------------------------------------------------------------------
router.route("/logout")
.get(adminController.getAdminLogout)

 module.exports = router;
