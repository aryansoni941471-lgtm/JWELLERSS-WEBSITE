const fs = require('fs');
const path = require('path');

const files = [
    'server.js',
    'app.js',
    'data.js',
    'index.html',
    'calculator.html',
    'certificate.html',
    'investment.html',
    'package.json'
];

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replacements
        content = content.replace(/LJS JEWELLERY/g, 'LAXMINARAYAN JWELLERS');
        content = content.replace(/LJS Jewellery/g, 'LAXMINARAYAN JWELLERS');
        content = content.replace(/LJS JWELLERY/g, 'LAXMINARAYAN JWELLERS');
        content = content.replace(/LJS Jwellary/g, 'LAXMINARAYAN JWELLERS');
        content = content.replace(/ljsjewellery\.com/g, 'laxminarayanjwellers.com');
        content = content.replace(/LJS Contact Form/g, 'LAXMINARAYAN Contact Form');
        content = content.replace(/LJS Admin/g, 'LAXMINARAYAN Admin');
        content = content.replace(/LJS Luxury Plaza/g, 'LAXMINARAYAN Luxury Plaza');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
