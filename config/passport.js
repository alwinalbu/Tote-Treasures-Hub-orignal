// passport.js

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userSchema');

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:7001/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Find the user by Google ID
            let user = await User.findOne({ googleId: profile.id });

           console.log("google user is",user)
            // If the user doesn't exist, create a new one`
            if (!user) {

                console.log('Creating a new user with Google ID:', profile.id);

                user = new User({
                    Username: profile.displayName,
                    Email: profile.emails[0].value,
                    googleId: profile.id,
                    Status: 'Active',
                    // ... other fields
                });
                await user.save();

                console.log("google user is",user)
            }

            // Return the user
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};

