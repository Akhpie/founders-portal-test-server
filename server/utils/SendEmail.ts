// import nodemailer from "nodemailer";

// export const sendEmail = async (
//   email: string,
//   subject: string,
//   html: string
// ) => {
//   const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject,
//     html,
//   });
// };

// // Function for sending reset password email
// export const sendPasswordResetEmail = async (email: string, token: string) => {
//   const resetPasswordUrl = `http://localhost:5173/reset-password?token=${token}`;

//   const html = `
//     <p>You requested a password reset</p>
//     <p>Click the link below to reset your password:</p>
//     <a href="${resetPasswordUrl}">Reset Password</a>
//   `;

//   await sendEmail(email, "Password Reset Request", html);
// };

import nodemailer from "nodemailer";

// Create transporter once and reuse it
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true, // Use pooled connections
  maxConnections: 5, // Limit concurrent connections
  rateDelta: 1000, // Delay between messages in milliseconds
  rateLimit: 5, // Max number of messages per rateDelta
});

export const sendEmail = async (
  email: string,
  subject: string,
  html: string
) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
    throw error;
  }
};

// New function for bulk emails
export const sendBulkEmail = async (
  emails: string[],
  subject: string,
  html: string
) => {
  const results = {
    successful: [] as string[],
    failed: [] as { email: string; error: string }[],
  };

  // Send emails in batches of 5
  const batchSize = 5;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const promises = batch.map(async (email) => {
      try {
        await sendEmail(email, subject, html);
        results.successful.push(email);
      } catch (error) {
        results.failed.push({
          email,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    await Promise.all(promises);

    // Add a small delay between batches to prevent rate limiting
    if (i + batchSize < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
};

// Function for sending reset password email
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetPasswordUrl = `http://localhost:5173/reset-password?token=${token}`;

  const html = `
    <p>You requested a password reset</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetPasswordUrl}">Reset Password</a>
  `;

  await sendEmail(email, "Password Reset Request", html);
};

// Optional: Add a function to send test email
export const sendTestEmail = async (email: string) => {
  const html = `
    <h1>Test Email</h1>
    <p>This is a test email to verify the email service is working correctly.</p>
    <p>Sent at: ${new Date().toLocaleString()}</p>
  `;

  await sendEmail(email, "Test Email", html);
};
