// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');
const msg = {
    to: 'sachinbaralramesh@gmail.com',
    from: 'sachinbaralramesh@gmail.com',
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};
sgMail.send(msg, function(err, res) {
    console.log(err);
});