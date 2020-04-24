var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    lat: String,
    long: String,
    pin_icon_type: String,
}, {
    timestamps: true
});


//create the model for users and expose it to our app
module.exports = mongoose.model('map_lat_long', userSchema);
