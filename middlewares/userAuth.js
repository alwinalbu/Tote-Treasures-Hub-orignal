const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = {
    userTokenAuth: async (req, res, next) => {
        const token = req.cookies.userJwt 
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) {
                    
                    res.redirect("/signup")
                }
                req.session.user = user;
                next()
            })
        }else{
            console.log("error here while sign up")
            req.session.user = false
            const error = req.flash('Please Login or Signup');
            res.render("user/signup", { err: error, user: '' });  

        }
    },
    
    userExist: (req, res, next) => {
        const token = req.cookies.userJwt;
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) {
                    next();
                }
                else {
                    res.redirect('/homepage')
                }
            })
        }
        else {
            next();
        }
    },
}