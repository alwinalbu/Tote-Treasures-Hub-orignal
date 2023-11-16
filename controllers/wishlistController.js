const User = require('../models/userSchema');
const { ObjectId } = require('mongoose').Types;

module.exports = {
    getWishList: async (req, res) => {
        try {
            const userId = req.session.user.user;

            const user = await User.findOne({ _id: userId }).populate('Wishlist.productId');

            res.render("user/wishlist", { wishlist: user.Wishlist, user });
        } catch (error) {
            console.error(error);
            res.status(500).render('error', { error });
        }
    },

    addToWishList: async (req, res) => {
        try {
            const productId = req.params._id;
            const userId = req.session.user.user;
    
            const user = await User.findById(userId);
    
            console.log("wishlist user is", user);
            console.log('productId:', productId);
            console.log('user.Wishlist:', user.Wishlist);
    
            const isProductInWishlist = user.Wishlist.some(item => item.productId && item.productId.equals(productId));
    
            if (isProductInWishlist) {
                return res.json({ success: false, message: 'Product is already in the wishlist' });
                
            } else {
                console.log("inside wishlist adding");
    
                const updatedUser = await User.findOneAndUpdate(
                    { _id: userId },
                    { $push: { Wishlist: { productId: productId } } },
                    { new: true } // Return the modified document rather than the original
                );
    
                if (updatedUser) {
                    res.json({
                        success: true,
                        message: "Added to wishlist",
                        wishlist: updatedUser.Wishlist,
                        user: updatedUser, 
                    });
                    
                } else {
                    res.status(400).json({ error: 'Failed to add to wishlist' });
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },



    removeItemFromWishlist: async (req, res) => {
        try {
            const userId = req.session.user.user;
            const productId = req.params._id;
    
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $pull: { Wishlist: { productId: productId } } },
                { new: true }
            );
    
            console.log("User after wishlist deletion:", updatedUser);
    
            res.redirect("/wishlist");
        } catch (error) {
            console.error("Error removing item from wishlist:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    },
    
    
};
