const user = require('../../models/user.model');
const common = require('../../config/functions');
const jwt = require('jsonwebtoken');
const chat = require('../../models/chat.model');
const pin = require('../../models/map_lat_long.model');

exports.signup = function(req, res){
    console.log(req.body);
    if(req.body.email && req.body.username && req.body.password && req.body.profile_pick && req.body.device_token && req.body.device_os){
        var newuser = new user();
            newuser.username = req.body.username;
            newuser.password = newuser.generateHash(req.body.password);
            newuser.email = req.body.email;
            newuser.country = req.body.country;
            newuser.profile_pick = req.body.profile_pick;
            newuser.device_token = req.body.device_token;
            newuser.device_os = req.body.device_os;
            common.findExistingUser(req.body.username, req.body.email, (err, result, type) => {
                if(err){
                    return res.json({
                        success: 0,
                        message: err,
                        data: ''
                    });
                } else if(result){
                    if(type == "email"){
                        return res.json({
                            success: 0,
                            message: "email  is already registered",
                            data: ''
                        });
                    } else {
                        return res.json({
                            success: 0,
                            message: "username is already registered",
                            data: ''
                        });
                    }
                } else if(!result && type == "notfound"){
                    newuser.save(function(err){
                        if(err){
                            return res.json({
                                success: 0,
                                message: err,
                                data: ''
                            });
                        } else {
                            var token = common.generateAccessToken(newuser.toJSON());
                            return res.json({
                                success: 1,
                                message: "user account is created",
                                profile_pick: newuser.profile_pick,
                                user: newuser.username,
                                user_token: token
                            });
                        }
                    });
                }
            })
    } else {
        return res.json({
            success: 0,
            message: "All fields are required",
            data: ''
        });
    }


}

exports.login = function(req, res){
    console.log(req.body);
    if(req.body.username && req.body.password && req.body.device_token && req.body.device_os){
        user.findOne({'username': req.body.username}, function(err, found){
            if (err){
                return res.json({
                    success: 0,
                    message: err,
                    data: ''
                });
            }

            if (!found) {
                return res.json({
                    success: 0,
                    message: "User not found",
                    data: ''
                });
            }

            if (found.validPassword(req.body.password)){
                console.log(process.env.ACCESS_TOKEN_SECRET)
                var token = common.generateAccessToken(found.toJSON());
                user.findByIdAndUpdate(found._id, {device_token: req.body.device_token, device_os: req.body.device_os}, {new: true});
                return res.json({
                    success: 1,
                    message: "LoggedIn",
                    profile_pick: found.profile_pick,
                    user: found.username,
                    user_token: token,
                });
            } else {
                return res.json({
                    success: 0,
                    message: 'username Or Password Does Not Match.',
                    data: ''
                });
            }
        });
    } else {
        return res.json({
            success: 0,
            message: "all field required for login",
            data: ''
        });
    }
}

// ==================== map integration apis ========================

exports.lat_long = function(req, res){
    exports.findOrCreate = function(req, res){
        jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, found) =>{
            if(err){
                return res.json({
                    success: 0,
                    message: err,
                    data: ''
                });
            } else {
                if(req.body.current_lat && req.body.current_long && req.body.pin_icon_type){
                    return res.json({
                        success: 0,
                        message: "Under Construction",
                        data: ''
                    });
                } else {
                    return res.json({
                        success: 0,
                        message: "All fields are required",
                        data: ''
                    });
                }
            }
        });
    }
}

// ==================================================================

// ============ create chat room  and show chat history =============


exports.findOrCreate = function(req, res){
    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, found) =>{
        if(err){
            return res.json({
                success: 0,
                message: err,
                data: ''
            });
        } else {
            if(found._id && req.body.usertwo_id) {
                common.chatData(found._id, req.body.usertwo_id, (err, result)=>{
                    if(err){
                        return res.json({
                            success: 0,
                            message: err,
                            data: ''
                        });
                    } else {
                        return res.json({
                            success: 1,
                            message: "chat",
                            data: result
                        });
                    }
                })
            } else {
                return res.json({
                    success: 1,
                    message: "input filled empty",
                    data: ''
                });
            }
        }
    });

}

exports.getOldChatList = function(req, res){
    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, found) =>{
        if(err){
            return res.json({
                success: 0,
                message: err,
                data: ''
            });
        } else if(found) {
            chat.find({$or: [{userOne: found._id},{ userTwo: found._id}]}, 'userOne userTwo')
            .populate('userOne userTwo', '_id firstname lastname p_image')
            .exec(function(err, chatId){
                if(err){
                    return res.json({
                        success: 0,
                        message: err,
                        data: ''
                    });
                } else if(chatId){
                    return res.json({
                        success: 1,
                        message:"chat list",
                        data: chatId,
                    });
                } else {
                    return res.json({
                        success: 0,
                        message:"chat list empty",
                        data: ''
                    });
                }
            });
        }
    });
}


// ==================================================================

