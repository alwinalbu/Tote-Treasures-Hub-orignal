const mongoose = require('mongoose');

const { Schema } = mongoose;


const shippedAddressSchema = new Schema({
  Name: { type: String, required: true },
  Address: { type: String, required: true },
  Pincode: { type: String, required: true },
  City: { type: String, required: true },
  State: { type: String, required: true },
  Mobile: { type: Number, required: true },
});


const ordersSchema = new Schema({
  UserId:  { type: Schema.Types.ObjectId, ref: 'User' },
  Status: { type: String, default: "Order Placed" },
  Items: [{
    ProductId: { type: Schema.Types.ObjectId, ref: "Products" },
    Quantity: { type: Number },
  }],
  PaymentMethod: { type: String },
  OrderDate: { type: Date },
  TotalPrice: { type: Number },
  PaymentStatus: { type: String, default: "Pending" },

  Address: { type: shippedAddressSchema },
  ReturnReason: String,
});


const Orders = mongoose.model('Orders', ordersSchema);

module.exports = Orders; 
