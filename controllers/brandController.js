const Brand = require("../models/brandSchema");
const Admin=require("../models/adminSchema")


module.exports = {
    getAddBrand: (req, res) => {
        const adminName = req.session.admin.Name;
        res.render("admin/addBrand",{ adminName });
      },

      
      getbrandpage:async (req,res)=>{
        const brands = await Brand.find();
        res.render("admin/brandpage", { brands });
      },
      

      postAddBrand: async (req, res) => {
        try {
          const brandname=req.body.Name;
          console.log(brandname)
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
        res.render("admin/editBrand",{brand,adminName})
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
        console.log("Route accessed: /admin/deleteBrand/" + id); // Debug line
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