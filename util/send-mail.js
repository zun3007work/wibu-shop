const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  auth: {
    user: 'dungminer69@gmail.com',
    pass: 'xsmtpsib-cb4371a49faec7dce774e7a45fa016aa5a88d9487d09c05384d4ef55b68c0a50-714Rm8caMkxqGtLs',
  },
});

module.exports.sendEmail = function (from, to, subject, html) {
  const mailOption = { from: from, to: to, subject: subject, html: html };
  transporter.sendMail(mailOption, (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('Mail has been sent.');
    }
  });
};
