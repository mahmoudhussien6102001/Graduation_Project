const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: 'laura.tremblay@ethereal.email',
          pass: 'FuTATs87w7DAApNse6'
      }
  });

    // 2) Define email options
    const emailOptions = {
        from: 'Mahmoud Awad <awadppp389@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // 3) Actually send the email
    await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
