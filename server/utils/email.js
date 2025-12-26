import nodemailer from "nodemailer";

export const sendResetEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Test connection
  // await transporter.verify();

  return transporter.sendMail({
    from: `"KI-VAN Support" <no-reply@kivan.com>`,
    to,
    subject,
    html,
  });
};
