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
            req.session.user = false
            res.render("user/signup")
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