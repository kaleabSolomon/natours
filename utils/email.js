const nodemailer = require('nodemailer');
// create a transporter
let transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});
const sendEmail = async options => {
  // actually send the email
  const mail = await transport.sendMail({
    from: 'Kaleab Solomon <kaleabslmn@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  });
};

module.exports = sendEmail;
