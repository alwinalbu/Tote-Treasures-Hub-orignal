const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Brand = require("../models/brandSchema");
const flash = require("express-flash");
const Admin = require("../models/adminSchema");
const moment = require("moment");

module.exports = {

    getAddProduct: async (req, res) => {
        const categories = await Category.find();
        const brands = await Brand.find();
        res.render("admin/addProduct", { categories, brands,messages: req.flash() });
      },


      postAddProduct: async (req, res) => {
        try {
          console.log(req.files);
          const images = [];
          const category = await Category.findOne({ Name: req.body.Category });
          const BrandName = await Brand.findOne({ Name: req.body.BrandName });
          for (let i = 1; i <= 3; i++) {
            const fieldName = `image${i}`;
            if (req.files[fieldName] && req.files[fieldName][0]) {
              images.push(req.files[fieldName][0].filename);
            }
          }
          let Status;
      
          if (req.body.AvailableQuantity <= 0) {
            Status = "Out of Stock";
          } else {
            Status = "In Stock";
          }
      
          // Data validation can be added here
      
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
          });
      
          // Wait for the product to be saved
          await newProduct.save();
      
          // Redirect to the appropriate route after successfully adding the product
          req.flash("success", "Product is Added Successfully");
          res.redirect("/admin/addProduct");
        } catch (error) {
          console.error(`An error happened: ${error}`);
          res.status(500).send('Internal Server Error');
        }
      },

      getProduct: async (req, res) => {
        try {
          const products = await Product.find()
            .populate('BrandName', 'Name') // Populate the BrandName field with Name property
            .populate('Category', 'Name')   // Populate the Category field with name property
            .lean();
      
          console.log("Products:", products); // Add this line
          res.render("admin/productpage", {
            products,
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
    
        res.render("admin/editProduct", {
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
          const existingProduct = await Product.findById({_id});
        
          if (existingProduct) {
            images.push(...existingProduct.images); 
        }
        
        for (let i = 0; i < 3; i++) {
            const fieldName = `image${i+1}`;
            if (req.files[fieldName] && req.files[fieldName][0]) {
                images[i] = req.files[fieldName][0].filename;
            }
        }
        console.log("this is the body before upadate",req.body);

        const category = await Category.findOne({ Name: req.body.Category });
        const BrandName = await Brand.findOne({ Name: req.body.BrandName });
        
        req.body.Category = category._id;
        req.body.BrandName = BrandName._id;
        req.body.images = images;
        
        console.log("reached here after assigning ");

          if (req.body.AvailableQuantity <= 0) {
            req.body.Status = "Out of Stock";
          }


          const uploaded = await Product.findByIdAndUpdate(_id, req.body);
          req.flash("success", "Product is Updated Successfully");
          res.redirect("/admin/addProduct");
        } catch (error) {
          console.log(`An error happened ${error}`);
        }
      },

    }
      