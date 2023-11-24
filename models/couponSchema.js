const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const couponSchema = new mongoose.Schema({
  couponName: String,
  code: {
    type: String,
    unique: true,
    required: true
  },
  discount_type: {
    type: String,
    enum:'fixed', 
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
  expiration_date: {
    type: Date,
    required: true
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
      },
      status: {
        type: String,
        enum: ['used', 'expired'],
        default: 'used'
      }
    }
  ]
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
