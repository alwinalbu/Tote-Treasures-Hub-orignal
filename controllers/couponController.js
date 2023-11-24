const User = require("../models/userSchema");
const Coupon = require("../models/couponSchema");
const flash = require("express-flash");


module.exports={

    getCoupon: async(req,res)=>{
     try {        
    const coupons = await Coupon.find();
    res.render('admin/couponpage', { coupons });
   } catch (error) {
           
   console.error('Error fetching coupons:', error);
   res.status(500).render('error_template', { error: 'Internal Server Error' });
  }
}
}
