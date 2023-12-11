const User = require("../models/userSchema");
const Coupon = require("../models/couponSchema");
const flash = require("express-flash");
const Cart = require('../models/cartSchema')


module.exports = {

  // -----------------------------------------------Get Coupon------------------------------------------------------
  getCoupon: async (req, res) => {
    try {
      const coupons = await Coupon.find();
      res.render('admin/couponpage', { coupons });
    } catch (error) {

      console.error('Error fetching coupons:', error);
      res.status(500).render('error_template', { error: 'Internal Server Error' });
    }
  },

  // -------------------------------------Coupon Added-------------------------------------------------------------

  AddCoupon: async (req, res) => {

    try {

      const existingCoupon = await Coupon.findOne({ code: req.body.code });

      if (existingCoupon) {
        return res.json({ error: 'Coupon code already exists' });
      }

      const newCoupon = await Coupon.create(req.body);

      console.log('Coupon added successfully', newCoupon);

      res.json({ success: true, coupon: newCoupon });

    } catch (error) {

      console.error('Error adding coupon:', error);

      if (error.name === 'ValidationError') {

        res.status(400).json({ error: 'Invalid coupon data' });
      } else {

        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },

  // ---------------------------------------------Coupen Edit----------------------------------------------------

  // UpdateCoupon: async (req, res) => {
  //   const { couponId } = req.body;

  //   try {

  //     if (!mongoose.Types.ObjectId.isValid(couponId)) {
  //       return res.status(400).json({ success: false, error: 'Invalid couponId' });
  //     }

  //     const updatedCoupon = await Coupon.findByIdAndUpdate(
  //       couponId,
  //       { $set: req.body },
  //       { new: true }
  //     );

  //     if (!updatedCoupon) {
  //       return res.status(404).json({ success: false, error: 'Coupon not found' });
  //     }

  //     res.status(200).json({ success: true, updatedCoupon });
  //   } catch (error) {
  //     console.error('Error updating coupon:', error);
  //     res.status(500).json({ success: false, error: 'Internal server error' });
  //   }
  // },

  // --------------------------------------Delete Coupen----------------------------------------------------------

  // DeleteCoupon: async (req, res) => {
  //   try {
  //     const couponId = req.params.couponId;

  //     console.log('coupen for delte is :',couponId);

  //     const deletedCoupen = await Coupon.findByIdAndDelete(couponId)

  //     if (!deletedCoupen) {
  //       return res.status(404).json({ success: false, error: 'Coupon not found' });
  //     }

  //     res.json({ success: true, message: 'Coupon deleted successfully' });

  //   } catch (error) {
  //     console.error('Error In Deleting coupon:', error);
  //     res.status(500).json({ success: false, error: 'Internal server error' });
  //   }

  // },


  // -------------------------------------------Coupen Check in User Side------------------------------------------

  checkCoupon: async (req, res) => {
    try {
        console.log("inside try of check coupen ");
        const userId = req.session.user.user;
        const code = req.body.code;
        const total = req.body.total;
        let discount = 0;

        const couponMatch = await Coupon.findOne({ code, Status: "Active" });

        if (couponMatch) {
            
            const isCouponUsed = couponMatch.usedBy.some(used => used.userId.toString() === userId);

            if (isCouponUsed) {
                return res.json({ error: "You have already used this coupon." });
            }

            const hasAppliedCoupon = couponMatch.usedBy.some(used => used.userId.toString() === userId && used.status === 'used');

            if (hasAppliedCoupon) {
                return res.json({ error: "Another coupon is already applied. You can only use one coupon at a time." });
            }

            if (total >= couponMatch.minimum_purchase) {
                discount = couponMatch.discount_amount;

                req.session.temporaryCouponInfo = {
                    userId,
                    couponCode: couponMatch._id,
                    discount
                };
                await Cart.findOneAndUpdate({UserId:userId},{$set:{coupon:couponMatch._id}})

                res.json({ success: true, discount });
            } else {
                res.json({ error: `Cart should contain a minimum amount of ${couponMatch.minimum_purchase}` });
                discount=""
            }
        } else {
            res.json({ error: "No such active coupon found" });
        }
    } catch (error) {
        console.log(error);
        res.json({ error: "Some error occurred" });
    }
},

}
