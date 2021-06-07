const nodemailer = require("nodemailer");

exports.sendEmailWithNodemailer = (req, res, emailData) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.APP_SPECIFIC_PASSWORD,
    },
    tls: {
      ciphers: "SSLv3",
    },
  });
  
  return transporter
    .sendMail(emailData)
    .then((info) => {
      console.log(`Message sent: ${info.response}`);
      return res.json({
        message: `Email has been sent to your email. Follow the instruction to set your account`,
      });
    })
    .catch((err) => console.log(`Problem sending email: ${err}`));
};
