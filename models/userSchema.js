const mongoose = require('mongoose');
const { Schema, ObjectId  } = mongoose;

// Define the User schema
const UserSchema = new Schema({
    Username: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    Status: {
        type: String,
        default: 'Active'
    },
    Address: [{
        Name: {
            type: String
        },
        AddressLane: {
            type: String
        },
        City: {
            type: String
        },
        Pincode: {
            type: Number
        },
        State: {
            type: String
        },
        Mobile: {
            type: Number
        }
    }]
});

// Create a User model based on the UserSchema
const User = mongoose.model('User', UserSchema);

// Export the User model for use in other parts of your application
module.exports = User;
