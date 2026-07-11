const nodemailer = require('nodemailer');

async function main() {
    // Generate test SMTP service account from ethereal.email
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    try {
        let info = await transporter.sendMail({
            from: '"LJS Jewellery Admin" <admin@example.com>',
            to: "admin@example.com",
            subject: "Test Email",
            text: "This is a test email"
        });

        console.log("Email sent successfully: ", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (e) {
        console.error("Error sending email: ", e);
    }
}

main().catch(console.error);
