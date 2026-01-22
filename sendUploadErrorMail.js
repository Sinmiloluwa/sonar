import nodemailer from "nodemailer";

export const sendErrorEmail = async (to, subject, content) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `${content.message} \n\n Technical details: ${content.error}`,
  };

  return transporter.sendMail(mailOptions);
};