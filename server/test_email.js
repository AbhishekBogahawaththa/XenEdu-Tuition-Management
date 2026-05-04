const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abihisheakbogahawaththa@gmail.com',
    pass: 'xvhpehwdkiqzsasp',
  },
});

transporter.sendMail({
  from: 'abihisheakbogahawaththa@gmail.com',
  to: 'abihisheakbogahawaththa@gmail.com',
  subject: 'XenEdu Email Test',
  text: 'Email is working!',
}).then(() => {
  console.log('Email sent successfully!');
}).catch(err => {
  console.log('Error:', err.message);
});
