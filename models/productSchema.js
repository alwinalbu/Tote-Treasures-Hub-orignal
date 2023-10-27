const mongoose = require('mongoose');
const {Schema,ObjectId} = mongoose 
const ProductsSchema = new mongoose.Schema({
  
  ProductName: {
    type: String,
    required: true,
  },
  Price: {
    type: Number,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  BrandName: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'brand'
  },
  Tags: {
      type: Array,
  },
  images: {
    type: Array,
    required: true,
  },
  AvailableQuantity: {
    type: Number,
    required: true,
  },
  Category: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Categories'
  },
  DiscountAmount: {
    type: Number,
  },
  Status: {
    type: String,
    required: true,
  },
  Variation: {
    type: String,
  },
  ProductType: {
    type: String,
  },
  UpdatedOn: {
    type: String
  },
  Display: {
    type: String,
    required: true
  },
  Specification1: {
    type: String
  },
  deletedAt: { 
    type: Date
  }, 
});

const Products = mongoose.model("Products", ProductsSchema);

module.exports = Products;
