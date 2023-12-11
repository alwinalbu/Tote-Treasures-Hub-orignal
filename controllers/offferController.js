const User = require("../models/userSchema");
const flash = require("express-flash");
const Admin = require("../models/adminSchema")
const Brand = require("../models/brandSchema")
const Order = require('../models/orderSchema')
const Products = require('../models/productSchema')
const Category = require('../models/categorySchema')
const Offer = require('../models/offerSchema')


module.exports = {

    getOffers: async (req, res) => {

        try {
            const offers = await Offer.find({}).populate('category');
            const categories = await Category.find({})

            console.log("cate of offer", categories);

            res.render('admin/offers', { categories, offers })

        } catch (error) {

            console.error('Error in Offer page:', error);
            res.status(500).json({ error: 'Internal Server Error' });

        }
    },

    addOffers: async (req, res) => {
        const { category, percentage, startDate, endDate } = req.body;

        console.log("body of offer is :",category,percentage,startDate,endDate);
    
        if (!category || !percentage || !startDate || !endDate) {
            return res.status(400).json({ error: 'Missing Required Fields' });
        }
    
        try {
            const newOffer = new Offer({
                category,
                percentage,
                startDate,
                endDate
            });
            const savedOffer = await newOffer.save();

            console.log('new offer is ',savedOffer)

            console.log('new offer ID is:',savedOffer._id)
    
            const productsToUpdate = await Products.find({ Category: category });
    
            for (const product of productsToUpdate) {

                const offerPrice = product.DiscountAmount - (product.DiscountAmount * (percentage / 100));
                // product.offerPrice = Math.round(parseFloat(offerPrice.toFixed(1)) * 100);

                product.offerPrice =offerPrice;

                product.IsInOffer = true;
                product.offer = savedOffer._id;
                await product.save();

                console.log("offerPRICE is ",offerPrice);
            }

            res.status(200).json({ success: true, offers: savedOffer });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to add offer to the database' });
        }
    },
    

}