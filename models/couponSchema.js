const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const couponSchema = new mongoose.Schema({
  couponName: String,
  code: {
    type: String,
    unique: true,
    required: true
  },
  discount_amount: {
    type: Number,
    required: true
  },
  minimum_purchase: {
    type: Number,
    required: true
  },
  startDate:{
    type: Date,
    required: true
  },
  expiration_date: {
    type: Date,
    required: true
  },
  Status:{
    type: String,
    default : "Active"
  },
  usedBy: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
      },
      couponCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
      }
    }
  ]
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
