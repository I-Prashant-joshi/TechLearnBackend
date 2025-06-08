require('dotenv').config();
const nodemailer = require("nodemailer");

const mymail = process.env.EMAIL_USER;

const sendOtpMail = async (args) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: mymail,
        pass: process.env.EMAIL_PASS, // Use environment variable for password
      },
      secure:true,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: {
        name: "TechLearn",
        address: mymail,
      },
      to: args.email,
      subject: args.sub,
      html: args.text,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.log("🚀 ~ err:", err);
  }
};

exports.sendMail = async (args) => {
  return sendOtpMail(args);
};
