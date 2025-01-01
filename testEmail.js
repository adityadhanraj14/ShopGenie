const nodemailer = require('nodemailer');

// Step 3: Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',  // For Gmail. Change if you use another provider
  auth: {
    user: '',     // Replace with your email
    pass: ''             // Replace with your email password or app-specific password
  }
});

// Function to send a test email
const sendTestEmail = (recipientEmail, resetLink) => {
  // Step 4: Set up the email options
  const mailOptions = {
    from: '',             // Sender email
    to: recipientEmail,                              // Recipient email (dynamic)
    subject: 'Password Reset Request',
    text: `Click the following link to reset your password: ${resetLink}` // Customize the link
  };

  // Step 5: Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent: ' + info.response);
  });
};

// Export the function for use in your server code
module.exports = { sendTestEmail };
