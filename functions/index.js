const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Create a nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email when account status changes
exports.onAccountStatusChange = functions.firestore
  .document('clients/{userId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    // Only send email if approval status has changed
    if (newData.approved === previousData.approved) {
      return null;
    }

    const userEmail = newData.email;
    let emailContent;

    if (newData.approved) {
      // Account approved email
      emailContent = {
        from: '"Srinidhi BS" <noreply@srinidhibs.com>',
        to: userEmail,
        subject: 'Your Account Has Been Approved',
        html: `
          <h2>Welcome to Srinidhi BS!</h2>
          <p>Your account has been approved. You can now log in to access our services.</p>
          <p>Company: ${newData.companyName}</p>
          <p>Email: ${newData.email}</p>
          <p>Approved by: ${newData.approvedBy}</p>
          <p>Click <a href="https://srinidhibs.com/login">here</a> to log in.</p>
        `
      };
    } else {
      // Account rejected email
      emailContent = {
        from: '"Srinidhi BS" <noreply@srinidhibs.com>',
        to: userEmail,
        subject: 'Account Registration Status',
        html: `
          <h2>Account Registration Update</h2>
          <p>Unfortunately, your account registration could not be approved at this time.</p>
          <p>If you believe this is an error, please contact our support team.</p>
          <p>Company: ${newData.companyName}</p>
          <p>Email: ${newData.email}</p>
        `
      };
    }

    try {
      await transporter.sendMail(emailContent);
      console.log('Status change email sent to:', userEmail);
      return null;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new functions.https.HttpsError('internal', 'Error sending email');
    }
  });

// Notify admin of new registrations
exports.onNewRegistration = functions.firestore
  .document('clients/{userId}')
  .onCreate(async (snap, context) => {
    const newAccount = snap.data();
    
    // Email content for admin notification
    const adminEmailContent = {
      from: '"Srinidhi BS System" <noreply@srinidhibs.com>',
      to: 'mailsrinidhibs@gmail.com', // Your admin email
      subject: 'New Account Registration',
      html: `
        <h2>New Account Registration</h2>
        <p>A new account has been registered and requires approval:</p>
        <ul>
          <li>Company: ${newAccount.companyName}</li>
          <li>Contact Person: ${newAccount.contactPerson}</li>
          <li>Email: ${newAccount.email}</li>
          <li>Phone: ${newAccount.phone}</li>
          <li>Registration Date: ${new Date(newAccount.registrationDate).toLocaleString()}</li>
        </ul>
        <p>Click <a href="https://srinidhibs.com/admin">here</a> to review the registration.</p>
      `
    };

    try {
      await transporter.sendMail(adminEmailContent);
      console.log('Admin notification email sent for new registration');
      return null;
    } catch (error) {
      console.error('Error sending admin notification:', error);
      throw new functions.https.HttpsError('internal', 'Error sending admin notification');
    }
  });
