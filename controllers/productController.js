const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Brand = require("../models/brandSchema");
const Offer=require('../models/offerSchema')
const flash = require("express-flash");
const Admin = require("../models/adminSchema");
const moment = require("moment");


module.exports = {

    getAddProduct: async (req, res) => {
        const categories = await Category.find();
        const brands = await Brand.find();
        res.render("admin/addproduct", { categories, brands,messages: req.flash() });
      },


     
      postAddProduct: async (req, res) => {
        try {
            console.log(req.files);
            const images = [];
    
            const category = await Category.findOne({ Name: req.body.Category });
            const BrandName = await Brand.findOne({ Name: req.body.BrandName });
    
            const categoryOffer = await Offer.findOne({ category: category._id });
    
            for (let i = 1; i <= 3; i++) {
                const fieldName = `image${i}`;
                if (req.files[fieldName] && req.files[fieldName][0]) {
                    images.push(req.files[fieldName][0].filename);
                }
            }
    
            const Status = req.body.AvailableQuantity <= 0 ? "Out of Stock" : "In Stock";
    
         
            let offerPrice;
    
            if (categoryOffer) {
                const discountPercentage = categoryOffer.percentage || 0;
                offerPrice = req.body.DiscountAmount - (req.body.DiscountAmount * (discountPercentage / 100));
                console.log("offer price inside ADD NEW PRODUCT", offerPrice);
            }
    
           
            const newProduct = new Product({
                ProductName: req.body.ProductName,
                Price: req.body.Price,
                Description: req.body.Description,
                BrandName: BrandName._id,
                Tags: req.body.Tags,
                AvailableQuantity: req.body.AvailableQuantity,
                Category: category._id,
                Status: Status,
                Display: "Active",
                Specification1: req.body.Specification1,
                DiscountAmount: req.body.DiscountAmount,
                UpdatedOn: moment(new Date()).format("llll"),
                images: images,
                IsInOffer: !!categoryOffer,
                offer: categoryOffer ? categoryOffer._id : null,
                offerPrice: offerPrice,
            });
    
            await newProduct.save();
    
            req.flash("success", "Product is Added Successfully");
            res.redirect("/admin/product");
        } catch (error) {
            req.flash('error', `${error}`);
            res.redirect("/admin/addProduct");
        }
    },
    
    
      getProduct: async (req, res) => {
        try {
          const page = parseInt(req.query.page) || 1; 
           const perPage = 5;
           const skip = (page - 1) * perPage;

          const products = await Product.find().skip(skip).limit(perPage)
            .populate('BrandName', 'Name') 
            .populate('Category', 'Name')   
            .lean()
            .populate('offer');
            
          const totalCount = await Product.countDocuments();

          // console.log("Products:", products); 

          res.render("admin/productpage", {
            products,
            currentPage: page,
            perPage,
            totalCount,
            totalPages: Math.ceil(totalCount / perPage),
          });
        } catch (error) {
          console.error(error);
          res.status(500).send("Internal Server Error");
        }
      },

      blockProduct: async (req,res)=>{
       try {
        const _id= req.params._id;
        const productData=await Product.findOne({_id:_id});
        if(productData.Display==="Active"){
           const product=await Product.findByIdAndUpdate(_id,{
            Display:"Inactive",
           });
           res.redirect("/admin/product");
        }else if(productData.Display==="Inactive"){
          const product=await Product.findByIdAndUpdate(_id,{
            Display:"Active"
          });
          res.redirect("/admin/product");
        }
        
       } catch (error) {
        
        const alertMessage="Error alert here while Operation";
        req.session.alert=alertMessage;
        res.redirect("/admin/product");
       }
      },

      getviewProductDetails: async (req, res) => {
        const _id = req.params._id;
        const categories = await Category.find();
        const brands = await Brand.find();
        const product = await Product.findOne({ _id }).populate('Category BrandName')
        console.log(product);
    
        res.render("admin/viewproductdetails", {
          product: product,
          categories,
          brands,
        });
      },

      getEditProduct: async (req, res) => {
        const _id = req.params._id;
        const categories = await Category.find();
        const brands = await Brand.find();
        const product = await Product.findOne({ _id }).populate('Category BrandName')
        console.log(product);
    
        res.render("admin/editproduct", {
          product: product,
          categories,
          brands,
        });
      },

      postEditProduct: async (req, res) => {
        const _id = req.params._id;
        console.log(_id);
        console.log(req.files);
      
        try {
          let images = [];
          const existingProduct = await Product.findById(_id);
      
          if (existingProduct) {
            images.push(...existingProduct.images);
          }
      
          for (let i = 0; i < 3; i++) {
            const fieldName = `image${i + 1}`;
            if (req.files[fieldName] && req.files[fieldName][0]) {
              images[i] = req.files[fieldName][0].filename;
            }
          }
      
          console.log("this is the body before update", req.body);
      
          const category = await Category.findOne({ Name: req.body.Category });
          const BrandName = await Brand.findOne({ Name: req.body.BrandName });
      
          req.body.Category = category._id;
          req.body.BrandName = BrandName._id;
          req.body.images = images;
      
          console.log("reached here after assigning ");
      
          if (req.body.AvailableQuantity <= 0) {
            req.body.Status = "Out of Stock";
          }
         
          const isDiscountUpdated = req.body.DiscountAmount !== existingProduct.DiscountAmount;
          const isInOffer = existingProduct.IsInOffer;
          
          if (isDiscountUpdated && isInOffer) {
            
            const offer = await Offer.findOne({ category: category._id });

            const percentage=offer.percentage;

            console.log("percentage inside edit product is ",percentage);

            const offerPrice = req.body.DiscountAmount - (req.body.DiscountAmount * (percentage / 100));

            console.log("offer price before ROUND",offerPrice)

            existingProduct.offerPrice= offerPrice
            
            console.log("New offer Price is",existingProduct.offerPrice)

            await existingProduct.save();
          }
          
          
          const uploaded = await Product.findByIdAndUpdate(_id, req.body, { new: true });
      
          req.flash("success", "Product is Updated Successfully");
          res.redirect("/admin/product");
        } catch (error) {
          console.error(`An error occurred: ${error.message}`);
          
          // Flash a generic error message
          req.flash("error", "An error occurred while updating the product.");
          res.redirect("/errorpage");
        }
      },


      filterProducts:async(req,res)=>{

        try {

         console.log("reached inside of filter FILTER");
         
          const filter = {};
      
          if (req.query.priceRangeMin && req.query.priceRangeMax) {

            filter.DiscountAmount = { $gte: parseInt(req.query.priceRangeMin), $lte: parseInt(req.query.priceRangeMax) };
          }
      
          if (req.query.selectedBrands) {
            const BrandIds = await Brand.find({ Name: { $in: req.query.selectedBrands  } }).distinct('_id');
            filter.BrandName = { $in: BrandIds };
          }
      
          if (req.query.selectedCategories) {
            
            const categoryIds = await Category.find({ Name: { $in: req.query.selectedCategories } }).distinct('_id');
            filter.Category = { $in: categoryIds };
          }
          
          const products = await Product.find(filter);
      
          console.log("products after search  filter is HERE ",products)

          res.json(products);

        } catch (error) {
          console.error('Error filtering products:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      },
    }
      