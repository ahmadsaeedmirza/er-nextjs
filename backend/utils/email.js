// const nodemailer = require("nodemailer");
// const dotenv = require("dotenv");

// const sendEmail = async (options) => {
//   // 1) Create a transporter (using Gmail for your client)
//   const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD, // Use an "App Password" from Google
//     },
//   });

//   // 2) Define email options
//   const mailOptions = {
//     from: `Salon Name <${process.env.EMAIL_USERNAME}>`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;

const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    // If using Gmail, use 'Gmail' or the host/port below
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD, // Use your 16-character App Password
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: `E&R Salon <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
