const nodemailer = require('nodemailer');
const fs = require('fs');
var method = {}

mail.address = (from, to, subject, msg, token) => {
// async..await is not allowed in global scope, must use a wrapper
async function main() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'gmail',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'darkp0052@gmail.com', // generated ethereal user
            pass: 'save1andquit' // generated ethereal password
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: from, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: mgs,
      html: msg
    })
  main().then(function(){
        console.log("working fine");
  }).catch(console.error, function(){
        console.log("=========================---this is catch function---=========================");
  });
    return {
        from: from,
        to: to,
        subject: subject,
        msg: msg,
        token: token
    };
}
}

module.exports = method;