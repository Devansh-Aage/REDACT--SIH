const nodemailer = require("nodemailer");
const expressAsyncHandler = require("express-async-handler");
const express = require("express");
const checkAdmin = require("../middleware/checkAdmin");
require("dotenv").config();
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

router.post(
  "/send-emp-mail",
  checkAdmin,
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    var mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "Employee Credentials for Redactronix",
      text: `Your employee credentials are Email: ${email} and Password: ${password} \n 
        Please Login to Redactronix`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json({ message: "Email sent successfully" });
      }
    });
  })
);

module.exports = router;
