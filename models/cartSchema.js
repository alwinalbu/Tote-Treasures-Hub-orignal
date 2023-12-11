const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const CartSchema = new Schema({
  UserId: { type: Schema.Types.ObjectId, ref: 'User'},
  Items: [
    {
      ProductId: {
        type: Schema.Types.ObjectId,
        ref: "Products",
      },
      Quantity: {
        type: Number,
      },
    },
  ],
  TotalAmount: {
    type: Number,
  },
  coupon:{
    type: Schema.Types.ObjectId,
    ref: "Coupon",
  }
});

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;