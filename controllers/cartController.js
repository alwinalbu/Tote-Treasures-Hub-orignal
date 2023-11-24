const Product = require("../models/productSchema");
const Cart = require("../models/cartSchema");
const flash = require('express-flash');

module.exports = {
  // checkStock: async (req, res) => {

  //   const userId = req.session.user.user;

  //   const userCart = await Cart.findOne({ UserId: userId });

  //   console.log("userCart while checking stock", userCart);

  //   if (userCart) {
  //     const existingCart = userCart.Items.map(async (cartItem) => {

  //       const product = await Product.findById(cartItem.ProductId);
        
  //       if (product) {
  //         return { 
  //           productId: cartItem.ProductId,
  //           availableQuantity: product.AvailableQuantity,
  //           requestedQuantity: cartItem.Quantity
  //          };
  //       } else{
  //           res.json({error:"No products found"})
  //       }
  //     });
  //     Promise.all(existingCart).then((results)=>{
  //       const itemsWithInsufficientStock = results.filter(
  //           (result) =>
  //             result.availableQuantity < result.requestedQuantity
  //         );
  //         if (itemsWithInsufficientStock.length > 0) {
  //           res.json({error:"Insufficient stock for some items",itemsWithInsufficientStock})
  //           console.log('Insufficient stock for some items:', itemsWithInsufficientStock);
  //         } else {
  //           res.json({success:true})
  //           console.log('All items have sufficient stock.');
  //         }
  //       })
  //       .catch((error) => {
  //           console.error('Error while checking stock:', error);
  //         });
  //   }
  // },

  checkStock: async (req, res) => {
    try {
      const userId = req.session.user.user;
      const userCart = await Cart.findOne({ UserId: userId });
  
      console.log("userCart while checking stock", userCart);
  
      if (userCart) {
        const existingCart = await Promise.all(
          userCart.Items.map(async (cartItem) => {
            const product = await Product.findById(cartItem.ProductId);
  
            if (product) {
              // Check if the product is blocked
              if (product.Display === "Inactive") {
                return {
                  productId: cartItem.ProductId,
                  blocked: true,
                };
              }
  
              return {
                productId: cartItem.ProductId,
                availableQuantity: product.AvailableQuantity,
                requestedQuantity: cartItem.Quantity,
                blocked: false,
              };
            } else {
              res.json({ error: "No products found" });
            }
          })
        );
  
        const blockedItems = existingCart.filter((item) => item.blocked);
  
        if (blockedItems.length > 0) {
          res.json({
            error: "Some items are blocked by the admin",
            blockedItems,
          });
          console.log("Some items are blocked by the admin:", blockedItems);
        } else {
          const itemsWithInsufficientStock = existingCart.filter(
            (result) => result.availableQuantity < result.requestedQuantity
          );
  
          if (itemsWithInsufficientStock.length > 0) {
            res.json({
              error: "Insufficient stock for some items",
              itemsWithInsufficientStock,
            });
            console.log(
              "Insufficient stock for some items:",
              itemsWithInsufficientStock
            );
          } else {
            res.json({ success: true });
            console.log("All items have sufficient stock.");
          }
        }
      }
    } catch (error) {
      console.error("Error while checking stock:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  


};

  


