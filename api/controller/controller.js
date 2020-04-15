const user = require('../../models/user.model');
const common = require('../../config/functions');
const jwt = require('jsonwebtoken');
const chat = require('../../models/chat.model');

exports.signup = function(req, res){
    console.log(req.body);
    if(req.body.phone && req.body.email && req.body.lastname && req.body.firstname && req.body.password){
        var newuser = new user();
            newuser.firstname = req.body.firstname;
            newuser.lastname = req.body.lastname;
            newuser.phone = req.body.phone;
            newuser.email = req.body.email;
            newuser.password = newuser.generateHash(req.body.password);

        user.findOne({"email": req.body.email}, function(err, found){
            if(err){
                return res.json({
                    message: "please try again later",
                    error: err
                });
            } else if(found){
                return res.json({
                    message: "email is already registered",
                });
            } else {
                newuser.save(function(err){
                    if(err){
                        return res.json({
                            message: "please try again later",
                            error: err
                        });
                    } else {
                        return res.json({
                            message: "user account is created",
                            user: newuser
                        });
                    }
                });
            }
        });

    } else {
        return res.json({
            code: 200,
            message: "firstname, lastname, email, phone, password these fields are required"
        });
    }


}

exports.login = function(req, res){
    console.log(req.body);
    if(req.body.email && req.body.password){
        user.findOne({'email': req.body.email}, function(err, found){
            if (err){
                return res.json({
                    error: "Something went wrong please try again later"
                });
            }

            if (!found) {
                return res.json({
                    message: "User not found"
                });
            }

            if (found.validPassword(req.body.password)){
                console.log(process.env.ACCESS_TOKEN_SECRET)
                var token = common.generateAccessToken(found.toJSON());
                var refreshToken = jwt.sign(found.toJSON(), process.env.REFRESH_TOKEN_SECRET);
                console.log('============================');
                return res.json({
                    message: "LoggedIn",
                    user: found,
                    token: token,
                });
            } else {
                return res.json({
                    message: 'Email Or Password Does Not Match.'
                });
            }
        });
    } else {
        return res.json({
            message: "email and password is required for login",
        });
    }
}


// ============ create chat room  and show chat history =============




exports.findOrCreate = function(req, res){
    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, found) =>{
        if(err){
            return res.json({
                error: err
            });
        } else {
            if(found._id && req.body.usertwo_id) {
                common.chatData(found._id, req.body.usertwo_id, (err, result)=>{
                    if(err){
                        return res.json({
                            code:201,
                            success: false,
                            message: err
                        });
                    } else {
                        return res.json({
                            code:200,
                            success: true,
                            message: result
                        });
                    }
                })
            } else {
                return res.json({
                    code:201,
                    success: false,
                    message: "input filled empty"
                });
            }
        }
    });

}

exports.getOldChatList = function(req, res){
    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, found) =>{
        if(err){
            return res.json({
                error: err
            });
        } else if(found) {
            chat.find({$or: [{userOne: found._id},{ userTwo: found._id}]}, 'userOne userTwo')
            .populate('userOne userTwo', '_id firstname lastname p_image')
            .exec(function(err, chatId){
                if(err){
                    return res.json({
                            message:err,
                            code:201,
                            success: false,
                        });
                } else if(chatId){
                    return res.json({
                        message:"chat list",
                        code:201,
                        success: true,
                        chat_list: chatId,
                    });
                } else {
                    return res.json({
                        message:"chat list empty",
                        code:201,
                        success: false,
                    });
                }
            });
        }
    });
}


// ==================================================================

