const nodemailer = require('nodemailer');

const EMAIL_USER = 'aryansoni941471@gmail.com';
const EMAIL_PASS = 'myotuwxidkitfauz';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

async function testEmail() {
    try {
        let info = await transporter.sendMail({
            from: `"LJS Jewellery Admin" <${EMAIL_USER}>`,
            to: EMAIL_USER,
            subject: "Test Email",
            text: "This is a test email"
        });
        console.log("Email sent successfully: ", info.response);
    } catch (e) {
        console.error("Error sending email: ", e);
    }
}

testEmail();
