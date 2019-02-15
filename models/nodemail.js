const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');

// async..await is not allowed in global scope, must use a wrapper

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing

// create reusable transporter object using the default SMTP transport
module.exports = function nodemail() {


    this.mailsend = function(user) {
        this.user = user;
        console.log(this.user.email_to);
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: "info@aastara.com", // generated ethereal user
                clientId: "372473141208-8ufa0qplvqdep53bjoau3885b7n67hp5.apps.googleusercontent.com",
                clientSecret: "vryi-2CWYjkBVS2SWJ2PT_vp",
                refreshToken: "1/Mm041wKRGHMHzqgDRAuuC4LLNuX3502EUd7CYvaqvl0" // generated ethereal password

            }
        });

        // setup email data with unicode symbols
        var mailOptions = {
            from: 'info@aastara.com', // sender address
            to: this.user.email_to, // list of receivers
            subject: this.user.subject, // Subject line
            text: this.user.text // plain text body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) { return err; }
            return ("A verification email has been sent to ", this.user.email_to);

        });
    }
}