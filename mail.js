const mailgun = require("mailgun-js");
const DOMAIN = 'sandboxed0c11dd22604554941dd37267703352.mailgun.org';
const mg = mailgun({ apiKey: '3728c261505780188b10f413ec35fddd-1b65790d-254f543a', domain: DOMAIN });
const data = {
    from: 'Excited User <sachinbaralramesh@gmail.com>',
    to: 'sachinbaral22@gmail.com, sachinbaralramesh@gmail.com',
    subject: 'Hello',
    text: 'Testing some Mailgun awesomness!'
};
mg.messages().send(data, function(error, body) {
    console.log(body);
});