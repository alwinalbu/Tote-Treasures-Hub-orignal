const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Brand = require("../models/brandSchema");
const flash = require("express-flash");
const Admin = require("../models/adminSchema");


module.exports = {
    getAddCategory: async (req, res) => {
        const adminName = req.session.admin.Name;
        res.render("admin/addcategory",{messages: req.flash(), adminName });
      },


      getCategory: async (req,res)=>{
        try {
          const page = parseInt(req.query.page) || 1; // Accessing page from query parameters
          const perPage = 3;
          const skip = (page - 1) * perPage;

        const categories = await Category.find({}).skip(skip).limit(perPage).sort({ Name: 1 });
        const totalCount = await Category.countDocuments();

        res.render("admin/categorypage", { 
          messages: req.flash(),
          categories,
          currentPage: page,
          perPage,
          totalCount,
          totalPages: Math.ceil(totalCount / perPage),
        });
      } catch (error) {
        res.send(error);
      }
    },


      postAddCategory: async (req, res) => {
        try {
          console.log(req.file);
          req.body.image = req.file.filename;
          const uploaded = await Category.create(req.body);
          res.redirect("/admin/Categorypage");
        } catch (error) {
          console.log(error);
          if (error.code === 11000) {
              req.flash("error", "Category already exist");
              res.redirect("/admin/addcategory");
          } else {
            req.flash("error", "Error Adding the Category");
            res.redirect("/admin/Categorypage");

          }
        }
      },
      deleteCategory:async (req, res) => {
        try {
          const id = req.params.id;
          console.log("Route accessed:/admin/deleteCategory/" + id); // Debug line
          console.log("id is :",id)
          await Category.findByIdAndRemove(id);
          res.redirect("/admin/Categorypage");
        } catch (error) {
          console.log("eror inside")
          console.error("Error removing user:", error);
          res.status(500).json({ message: "An error occurred while removing Category" });
        }
      },

      getEditCategory: async(req,res)=>{
        const _id=req.params._id;
        const category=await Category.findById(_id);
        res.render("admin/editcategory", { category })
      },

      postEditCategory: async(req,res)=>{
        const id = req.params._id
      try {
          if(req.file){
            req.body.image = req.file.filename
          }
          let category = await Category.updateOne({_id : id},{$set : req.body})
          req.flash("success", "Category Updated");
          res.redirect('/admin/Categorypage') 
      } catch (error) {
          if (error.code === 11000) {
              req.flash("error", "Category already exist");
              res.redirect(`/admin/editCategory/${id}`);
          } else {
            req.flash("error", "Error Adding the Category");
            res.redirect(`/admin/editCategory/${id}`);

          }
      }
  
    },

    getCategorybyId: async(req,res)=>{
      try {
        const categoryId = req.params._id;
        console.log('category id inside click image is ',categoryId)
        
        const products= await Product.find({ Category: categoryId }).populate('offer');
       
        if (! products) {
          
          return res.status(404).send(' Products not found');
        }
    
        
        res.render('user/searchresults', { user: req.session.user ?? null, products});
      } catch (error) {
        
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    },
}