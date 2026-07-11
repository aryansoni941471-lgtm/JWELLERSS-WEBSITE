require('dotenv').config();
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const EMAIL_USER = (process.env.EMAIL_USER || '').trim(); 
const EMAIL_PASS = (process.env.EMAIL_PASS || '').trim();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

let adminOtpStore = {}; // { email: { otp: string, expires: number } }

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'ljs_database.db');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_T1kTNuUmtfPs6m';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '6LagxfIVvLJH9jEGy5RaGXYY';

function makeHttpsRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // 1. API Endpoints
    if (req.url === '/api/payment-config' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ keyId: RAZORPAY_KEY_ID }));
    }

    if (req.url === '/api/create-razorpay-order' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const parsed = JSON.parse(body);
                const amountRupees = parseFloat(parsed.amount);
                if (isNaN(amountRupees) || amountRupees <= 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Invalid amount' }));
                }

                const amountInPaise = Math.round(amountRupees * 100);
                const authHeader = 'Basic ' + Buffer.from(RAZORPAY_KEY_ID + ':' + RAZORPAY_KEY_SECRET).toString('base64');
                const postData = JSON.stringify({
                    amount: amountInPaise,
                    currency: 'INR',
                    receipt: 'receipt_' + Math.floor(100000 + Math.random() * 900000)
                });

                const options = {
                    hostname: 'api.razorpay.com',
                    port: 443,
                    path: '/v1/orders',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader,
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };

                const response = await makeHttpsRequest(options, postData);
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(response.body);
                } else {
                    console.error('Razorpay Order API Error:', response.body);
                    res.writeHead(response.statusCode || 500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Failed to create order on Razorpay', details: response.body }));
                }
            } catch (e) {
                console.error('Error creating Razorpay order:', e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Internal server error creating order' }));
            }
        });
        return;
    }

    if (req.url === '/api/verify-razorpay-payment' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const parsed = JSON.parse(body);
                const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed;
                if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Missing required parameters' }));
                }

                const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
                hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
                const digest = hmac.digest('hex');

                if (digest === razorpay_signature) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: true, message: 'Payment verified successfully' }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: 'Signature verification failed' }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
        return;
    }

    if (req.url === '/api/send-admin-otp' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const parsed = JSON.parse(body);
                const adminEmail = parsed.email;
                if (!adminEmail) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Email required' }));
                }

                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                console.log(`\n==================================================`);
                console.log(`  ADMIN LOGIN OTP: ${otp}`);
                console.log(`==================================================\n`);

                adminOtpStore[adminEmail.toLowerCase()] = {
                    otp: otp,
                    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
                };

                const mailOptions = {
                    from: `"LAXMINARAYAN JWELLERS Admin" <${EMAIL_USER}>`,
                    to: adminEmail,
                    subject: 'Your Admin Login OTP - LAXMINARAYAN JWELLERS',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #d4af37;">Admin Access Requested</h2>
                            <p>You have requested to login to the admin panel.</p>
                            <p>Your One-Time Password (OTP) is: <strong style="font-size: 24px; color: #d4af37; background: #222; padding: 5px 15px; border-radius: 5px;">${otp}</strong></p>
                            <p>This OTP will expire in 5 minutes.</p>
                            <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not request this, please ignore this email.</p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: true, message: 'OTP sent successfully' }));
            } catch (e) {
                console.error('Error sending OTP email:', e.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: 'Failed to send OTP via Email. Please check your Gmail configuration.' }));
            }
        });
        return;
    }

    if (req.url === '/api/verify-admin-otp' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const parsed = JSON.parse(body);
                const adminEmail = parsed.email.toLowerCase();
                const otp = parsed.otp;

                const storeData = adminOtpStore[adminEmail];
                if (!storeData) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: 'OTP not requested or expired' }));
                }

                if (Date.now() > storeData.expires) {
                    delete adminOtpStore[adminEmail];
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: 'OTP has expired' }));
                }

                if (storeData.otp === otp) {
                    delete adminOtpStore[adminEmail]; // Clear OTP after success
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: 'Invalid OTP' }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid request' }));
            }
        });
        return;
    }

    if (req.url === '/api/contact-admin' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const parsed = JSON.parse(body);
                const { name, email, message } = parsed;

                const mailOptions = {
                    from: `"LAXMINARAYAN Contact Form" <${EMAIL_USER}>`,
                    to: EMAIL_USER, // Send to admin email
                    replyTo: email,
                    subject: `New Contact Request from ${name}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #d4af37;">New Contact Message</h2>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Message:</strong></p>
                            <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #d4af37; margin-top: 10px;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: true, message: 'Message sent successfully' }));
            } catch (e) {
                console.error('Error sending contact email:', e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Failed to send message' }));
            }
        });
        return;
    }

    if (req.url === '/api/send-status-update' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const parsed = JSON.parse(body);
                const { email, subject, message } = parsed;

                const mailOptions = {
                    from: `"LAXMINARAYAN JWELLERS" <${EMAIL_USER}>`,
                    to: email,
                    subject: subject,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #d4af37;">Activity Update</h2>
                            <p>${message.replace(/\n/g, '<br>')}</p>
                            <p style="color: #888; font-size: 12px; margin-top: 40px;">
                                LAXMINARAYAN JWELLERS | Quality & Trust<br>
                                If you have any questions, please contact us.
                            </p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: true, message: 'Status update email sent successfully' }));
            } catch (e) {
                console.error('Error sending status update email:', e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Failed to send status update email' }));
            }
        });
        return;
    }

    if (req.url === '/api/send-receipt' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const order = JSON.parse(body);
                
                // 1. Generate HTML for Email Body (Receipt Only)
                let itemsHtml = order.items.map(item => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name} (${item.metalType})</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.weight}g</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${item.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                `).join('');

                const receiptHtml = `
                    <div style="font-family: 'Times New Roman', Times, serif; padding: 30px; color: #111; max-width: 800px; margin: 0 auto; background: #fff;">
                        <div style="text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px;">
                            <h1 style="color: #d4af37; margin: 0; font-size: 32px; letter-spacing: 2px;">LAXMINARAYAN JWELLERS</h1>
                            <p style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Luxury Gold & Silver Collections</p>
                        </div>

                        <h2>Order Receipt</h2>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                            <tr>
                                <td style="padding: 5px 0;"><strong>Order ID:</strong> ${order.orderId}</td>
                                <td style="padding: 5px 0; text-align: right;"><strong>Date:</strong> ${order.dateTime}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0;"><strong>Customer Name:</strong> ${order.customerName}</td>
                                <td style="padding: 5px 0; text-align: right;"><strong>Payment Method:</strong> ${order.paymentMethod}</td>
                            </tr>
                        </table>

                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; text-align: left;">
                            <thead>
                                <tr style="background-color: #f8f8f8;">
                                    <th style="padding: 10px; border-bottom: 2px solid #d4af37;">Item Description</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #d4af37;">Weight</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #d4af37;">Qty</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #d4af37;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" style="padding: 15px 10px; text-align: right; font-weight: bold;">Grand Total:</td>
                                    <td style="padding: 15px 10px; font-weight: bold; color: #d4af37; font-size: 18px;">${order.totalAmount}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <p style="text-align: center; font-size: 14px; margin-top: 30px;">
                            <strong>Please find your Certificate of Authenticity attached as a PDF document.</strong>
                        </p>
                        
                        <p style="text-align: center; color: #888; font-size: 12px; margin-top: 40px; font-family: Arial, sans-serif;">
                            LAXMINARAYAN JWELLERS | Quality & Trust<br>
                            If you have any questions about this order, please contact us.
                        </p>
                    </div>
                `;

                // 2. Generate PDF Certificate of Authenticity in Memory
                const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', async () => {
                    const pdfData = Buffer.concat(buffers);

                    // 3. Send Email with Attachment
                    const mailOptions = {
                        from: `"LAXMINARAYAN JWELLERS" <${EMAIL_USER}>`,
                        to: order.customerEmail,
                        subject: `Order Receipt & Authenticity Certificate - ${order.orderId}`,
                        html: receiptHtml,
                        attachments: [
                            {
                                filename: `Certificate_${order.orderId}.pdf`,
                                content: pdfData,
                                contentType: 'application/pdf'
                            }
                        ]
                    };

                    try {
                        await transporter.sendMail(mailOptions);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ success: true, message: 'Receipt and PDF Certificate sent successfully' }));
                    } catch (emailErr) {
                        console.error('Error sending receipt email with PDF:', emailErr);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Failed to send receipt' }));
                    }
                });

                // Build PDF Content
                doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#d4af37'); // Outer Gold Border
                doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke('#d4af37'); // Inner Gold Border

                doc.moveDown(2);
                doc.fontSize(36).fillColor('#d4af37').text('LAXMINARAYAN JWELLERS', { align: 'center' });
                doc.fontSize(14).fillColor('#666').text('LUXURY GOLD & SILVER COLLECTIONS', { align: 'center' });
                doc.moveDown(2);
                
                doc.fontSize(28).fillColor('#d4af37').text('CERTIFICATE OF AUTHENTICITY', { align: 'center' });
                doc.moveDown(1);
                doc.fontSize(14).fillColor('#555').text('This document certifies the authenticity and quality of the jewellery pieces.', { align: 'center' });
                doc.moveDown(2);
                
                doc.fontSize(16).fillColor('#111');
                doc.text(`This is to certify that the items under Order Ref: `, { continued: true }).fillColor('#d4af37').text(order.orderId);
                doc.fillColor('#111').text(`Purchased by: `, { continued: true }).fillColor('#d4af37').text(order.customerName);
                doc.moveDown(1);

                doc.fillColor('#111').text('Are guaranteed to be crafted with genuine materials as specified, meeting the highest standards of quality and workmanship by LAXMINARAYAN JWELLERS.');
                doc.moveDown(2);

                let startY = doc.y;
                doc.fontSize(12).fillColor('#333');
                doc.text('Authorized Signatory', 100, startY + 50);
                doc.moveTo(100, startY + 45).lineTo(250, startY + 45).stroke('#333');
                doc.text('LAXMINARAYAN JWELLERS', 100, startY + 65);

                doc.text('Date of Issue', doc.page.width - 250, startY + 50);
                doc.moveTo(doc.page.width - 250, startY + 45).lineTo(doc.page.width - 100, startY + 45).stroke('#333');
                doc.text(new Date().toLocaleDateString(), doc.page.width - 250, startY + 65);

                doc.end();

            } catch (e) {
                console.error('Error generating receipt/PDF:', e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Failed to process receipt request' }));
            }
        });
        return;
    }

    if (req.url === '/api/load' && req.method === 'GET') {
        fs.readFile(DB_FILE, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Database file not found' }));
                }
                console.error('Error reading database file:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Internal server error reading database' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(data);
        });
        return;
    }

    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                // Parse to validate JSON format
                const parsed = JSON.parse(body);
                fs.writeFile(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing database file:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Failed to write database file' }));
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: true, message: 'Database saved successfully' }));
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
        return;
    }

    if (req.url === '/api/upload' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const parsed = JSON.parse(body);
                const base64Str = parsed.base64;
                if (!base64Str) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Missing base64 image data' }));
                }

                // Extract mime type and base64 data
                const matches = base64Str.match(/^data:image\/([A-Za-z0-9\-+]+);base64,(.+)$/);
                if (!matches || matches.length < 3) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Invalid base64 image format' }));
                }

                const ext = matches[1];
                const dataBuffer = Buffer.from(matches[2], 'base64');
                const fileName = `uploaded_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
                const imagesDir = path.join(__dirname, 'images');

                // Ensure images directory exists
                if (!fs.existsSync(imagesDir)) {
                    fs.mkdirSync(imagesDir, { recursive: true });
                }

                const filePath = path.join(imagesDir, fileName);
                fs.writeFile(filePath, dataBuffer, (err) => {
                    if (err) {
                        console.error('Error writing uploaded file:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Failed to write image to disk' }));
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: true, imagePath: `images/${fileName}` }));
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
        return;
    }

    // 2. Static Files serving
    let reqPath = req.url.split('?')[0].split('#')[0]; // strip query parameters/hash
    if (reqPath === '/') {
        reqPath = '/index.html';
    }

    const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(__dirname, safePath);

    // Security check: Ensure the path is inside the project root directory
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Fallback for HTML5 SPA Routing: serve index.html if file doesn't exist
            const fallbackPath = path.join(__dirname, 'index.html');
            fs.readFile(fallbackPath, (fallbackErr, htmlData) => {
                if (fallbackErr) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    return res.end('File Not Found');
                }
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end(htmlData);
            });
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`  LAXMINARAYAN JWELLERS Server is running!`);
    console.log(`  Local Address: http://localhost:${PORT}`);
    console.log(`==================================================`);
    console.log(`Press Ctrl+C to stop the server.`);
});
