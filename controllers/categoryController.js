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
        const categories = await Category.find();
        res.render("admin/Categorypage", { messages: req.flash(),categories });
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

    }