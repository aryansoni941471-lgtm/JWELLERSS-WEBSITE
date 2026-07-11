document.addEventListener('DOMContentLoaded', () => {
    // Set today's date by default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bill-date').value = today;
    
    // Generate random invoice number
    const invNo = 'INV-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('prev-invoice-no').innerText = invNo;

    // Add initial empty row
    addItemRow();
    
    // Initial preview update
    updateBillPreview();
});

let rowCount = 0;

function addItemRow() {
    rowCount++;
    const tbody = document.getElementById('items-input-body');
    const tr = document.createElement('tr');
    tr.id = `row-${rowCount}`;
    
    tr.innerHTML = `
        <td><input type="text" class="form-input item-desc" placeholder="E.g. Gold Ring 22K" oninput="updateBillPreview()"></td>
        <td><input type="number" class="form-input item-weight" placeholder="0" step="0.01" oninput="calculateRow(${rowCount}); updateBillPreview()"></td>
        <td><input type="number" class="form-input item-rate" placeholder="0" oninput="calculateRow(${rowCount}); updateBillPreview()"></td>
        <td><input type="number" class="form-input item-making" placeholder="0" oninput="calculateRow(${rowCount}); updateBillPreview()"></td>
        <td><span class="item-total" id="total-${rowCount}">0.00</span></td>
        <td><button class="btn btn-danger" onclick="removeRow(${rowCount})">X</button></td>
    `;
    
    tbody.appendChild(tr);
    updateBillPreview();
}

function removeRow(id) {
    const row = document.getElementById(`row-${id}`);
    if (row) {
        row.remove();
        updateBillPreview();
    }
}

function calculateRow(id) {
    const row = document.getElementById(`row-${id}`);
    if (!row) return;

    const weight = parseFloat(row.querySelector('.item-weight').value) || 0;
    const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
    const makingPercent = parseFloat(row.querySelector('.item-making').value) || 0;

    const basePrice = weight * rate;
    const makingCharges = basePrice * (makingPercent / 100);
    const total = basePrice + makingCharges;

    row.querySelector('.item-total').innerText = total.toFixed(2);
}

function updateBillPreview() {
    // Update Customer Details
    document.getElementById('prev-cust-name').innerText = document.getElementById('cust-name').value || 'Customer Name';
    document.getElementById('prev-cust-phone').innerText = document.getElementById('cust-phone').value || 'Phone Number';
    document.getElementById('prev-cust-address').innerText = document.getElementById('cust-address').value || 'Address';
    
    const dateVal = document.getElementById('bill-date').value;
    if (dateVal) {
        const d = new Date(dateVal);
        document.getElementById('prev-date').innerText = d.toLocaleDateString('en-IN');
    }

    // Update Items Table
    const inputRows = document.querySelectorAll('#items-input-body tr');
    const prevBody = document.getElementById('prev-items-body');
    prevBody.innerHTML = '';
    
    let subtotal = 0;
    let sNo = 1;

    inputRows.forEach(row => {
        const desc = row.querySelector('.item-desc').value || '-';
        const weight = parseFloat(row.querySelector('.item-weight').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const making = parseFloat(row.querySelector('.item-making').value) || 0;
        const total = parseFloat(row.querySelector('.item-total').innerText) || 0;

        if (desc !== '-' || weight > 0) {
            subtotal += total;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sNo++}</td>
                <td>${desc}</td>
                <td>${weight.toFixed(3)}</td>
                <td>${rate.toFixed(2)}</td>
                <td>${making}%</td>
                <td>${total.toFixed(2)}</td>
            `;
            prevBody.appendChild(tr);
        }
    });

    // Update Totals
    const gst = subtotal * 0.03; // 3% GST for jewellery
    const grandTotal = subtotal + gst;

    document.getElementById('prev-subtotal').innerText = `₹${subtotal.toFixed(2)}`;
    document.getElementById('prev-gst').innerText = `₹${gst.toFixed(2)}`;
    document.getElementById('prev-grand-total').innerText = `₹${grandTotal.toFixed(2)}`;
}

function printBill() {
    updateBillPreview();
    window.print();
}

function downloadPDF() {
    updateBillPreview();
    const element = document.getElementById('bill-template');
    const invoiceNo = document.getElementById('prev-invoice-no').innerText;
    
    const opt = {
        margin:       0,
        filename:     `${invoiceNo}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

function sendWhatsApp() {
    updateBillPreview();
    
    const phone = document.getElementById('cust-phone').value.trim();
    if (!phone) {
        alert("Please enter a customer phone number to send WhatsApp message.");
        return;
    }
    
    const name = document.getElementById('cust-name').value.trim() || 'Customer';
    const invoiceNo = document.getElementById('prev-invoice-no').innerText;
    const element = document.getElementById('bill-template');
    
    let message = `Dear ${name},%0A%0A`;
    message += `Thank you for shopping at *LAXMINARAYAN JWELLERS*!%0A%0A`;
    message += `Please find your invoice attached.%0A%0A`;
    message += `We look forward to serving you again.%0A`;
    message += `📍 LAXMINARAYAN Luxury Plaza, Noida%0A`;
    message += `📞 +91 98765 43210`;
    
    let formattedPhone = phone;
    if (formattedPhone.length === 10) {
        formattedPhone = '91' + formattedPhone;
    } else if (formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.substring(1);
    }
    
    const opt = {
        margin:       0,
        filename:     `${invoiceNo}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // WhatsApp Policy: Direct file attach is not allowed via simple URLs.
    // So we download the PDF automatically, and open the chat.
    // The user just needs to attach the downloaded PDF.
    
    // 1. Automatically download the bill
    html2pdf().set(opt).from(element).save();

    // 2. Open WhatsApp for that specific number (saved or unsaved)
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    
    // Slight delay so the download starts before switching tabs
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 1500);
}
