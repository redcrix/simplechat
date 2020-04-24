var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    username: String,
    country: String,
    profile_pick: String,
    email: String,
    password: String,
    device_token: String,
    device_os: String
}, {
    timestamps: true
});

//methods ======================
    //generating a hash
    userSchema.methods.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    //checking if password is valid
    userSchema.methods.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
    };

//create the model for users and expose it to our app
module.exports = mongoose.model('user', userSchema);
