const jwt = require('jsonwebtoken');
const chat = require('../models/chat.model');
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

module.exports = methods;