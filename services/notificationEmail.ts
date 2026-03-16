import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });

export const sendNotificationEmail = async (to: string, subject: string, bodyText: string): Promise<void> => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Sonar" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: bodyText,
    html: `<p>${bodyText}</p>`,
  });
};
