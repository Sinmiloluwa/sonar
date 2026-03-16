import nodemailer from "nodemailer";

interface ErrorContent {
  message: string;
  error: string;
}

export const sendErrorEmail = async (to: string, subject: string, content: ErrorContent): Promise<void> => {
  const transporter = nodemailer.createTransport({
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

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `${content.message} \n\n Technical details: ${content.error}`,
  };

  await transporter.sendMail(mailOptions);
};
