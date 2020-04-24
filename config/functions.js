const jwt = require('jsonwebtoken');
const chat = require('../models/chat.model');
const user = require('../models/user.model');
const pin = require('../models/map_lat_long.model');
var methods = {};

methods.generateAccessToken = (user)=>{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}

methods.chatData = (userId, adminId, callback) => {
    chat.findOne({$or:[{userOne: userId, userTwo: adminId},{userOne: adminId, userTwo: userId}]}, function(err, foundThread){
        if(err){
            callback(err, null);
        } else if(!foundThread){
            var thread = new chat();
            thread.userOne = userId,
            thread.userTwo = adminId
            thread.save(function(err, createdThread){
              if(err){
                callback(err, null);
              } else {
                callback(err, createdThread);
              }
            });
        } else if(foundThread){
            callback(err, foundThread);
        } else {
            callback("user not found", null);
        }
    });
}

methods.findExistingUser = (username, email, callback) => {
    user.findOne({"email": email}, function(err, foundEmail){
        if(err){
            callback(err, null, 'wentWrong');
        }
        if(foundEmail){
            callback(null, foundEmail, 'email');
        } else {
            user.findOne({"username": username}, function(err, foundUser){
                if(foundUser){
                    callback(null, foundUser, 'username');
                } else {
                    callback(null, false, 'notfound');
                }
            })
        }
    });
}

methods.findUserMapLocation = (userId, lat, long, pin_icon_type, callback) => {
    findOneAndUpdate({user: userId}, { lat: lat, long: long, pin_icon_type: pin_icon_type,}, {new: true})
    .exec(function(err, updated){
        if(err){
            callback(err, null);
        } else if(!updated){
            callback(null, false);
        } else {
            callback(null, updated);
        }
    })
}

module.exports = methods;