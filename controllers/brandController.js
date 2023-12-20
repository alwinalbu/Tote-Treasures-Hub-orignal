const Brand = require("../models/brandSchema");
const Admin=require("../models/adminSchema")
const User=require('../models/userSchema')


module.exports = {
    getAddBrand:(req, res) => {
        const adminName = req.session.admin.Name;
        res.render("admin/addbrand",{ adminName });
      },

      
      getbrandpage:async (req,res)=>{
        try {
        const page = parseInt(req.query.page) || 1; // Accessing page from query parameters
        const perPage = 4;
        const skip = (page - 1) * perPage;

        const brands = await Brand.find({}).skip(skip).limit(perPage).sort({ Name: 1 });

        const totalCount = await Brand.countDocuments();

        res.render("admin/brandpage", { 
          brands,
          currentPage: page,
          perPage,
          totalCount,
          totalPages: Math.ceil(totalCount / perPage),
        });
      } catch (error) {
        res.send(error);
      }
    },

      postAddBrand: async (req, res) => {
        try {
          const brandname=req.body.Name;
          console.log(brandname)
          const brandtest=!/^\s+$/
          const brand=await Brand.findOne({Name:brandname})
          if(brand){
            console.log("Brand already Exits")
            req.flash("error", "Brand already Exits");
            res.redirect("/admin/addBrand");
          }else {
          const brands = await Brand.create(req.body);
          res.redirect("/admin/brandpage");
          }
        } catch (error) {
          console.log(error);
          req.flash("error", "Error Adding the Brand");
          res.redirect("/admin/brandpage");
        }
      },

      getEditBrand: async (req,res) =>{
        const adminName = req.session.admin.Name;
        const _id = req.params._id;
        const brand = await Brand.findById(_id);
        res.render("admin/editbrand",{brand,adminName})
      },

      postEditBrand: async (req, res) => {
        const _id = req.params._id;
        const { Name } = req.body; // Assuming Name is a property in the request body.
    
        try {
            // Use exec() to return a promise from Mongoose
            const updatedName = await Brand.findByIdAndUpdate({ _id: _id }, { Name: Name }).exec();
    
            console.log("Updated brand name id:", updatedName);
    
            // Redirect to the specified URL
            res.redirect("/admin/brandpage");
        } catch (error) {
            // Handle any errors that occur during the update
            console.error("Error updating brand name:", error);
            // Optionally, you can display an error message to the user or take other appropriate actions.
            // res.status(500).send("Internal Server Error");
        }
    },
    
    deleteBrand: async(req, res) => {
      try {
        const id = req.params.id;

        console.log("Route accessed: /admin/deleteBrand/" + id); 

        console.log("id is :",id)

        await Brand.findByIdAndRemove(id);
        
        res.redirect("/admin/brandpage");
      } catch (error) {
        console.log("eror inside")
        console.error("Error removing user:", error);
        res.status(500).json({ message: "An error occurred while removing user" });
      }
    },
      
    

    }