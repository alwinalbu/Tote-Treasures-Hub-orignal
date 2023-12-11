const Cart = require('../models/cartSchema');
const User = require('../models/userSchema');

const calculateCartCount = async (req, res, next) => {
  try {
    const userId = req.session.user.user;

    console.log("here user is ",userId);

    const userCart = await Cart.findOne({ UserId: userId });

    console.log("usercart is inside count is ", userCart);

    if (userCart) {
      let cartCount = 0;

      for (const product of userCart.Items) {  
        cartCount += product.Quantity;  
      }
      console.log("inside cart count is", cartCount);

      res.locals.cartCount = cartCount;
    } else {
      res.locals.cartCount = 0;
    }
    next();
  } catch (error) {
    console.error(error);
    res.locals.cartCount = 0;
    next();
  }
};

module.exports = calculateCartCount;
