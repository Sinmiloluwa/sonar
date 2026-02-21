import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

export const sendNotificationEmail = async (to, subject, bodyText) => {
  const transporter = createTransporter();
  return transporter.sendMail({
    from: `"Sonar" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: bodyText,
    html: `<p>${bodyText}</p>`,
  });
};
