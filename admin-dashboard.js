document.addEventListener('DOMContentLoaded', () => {
    // Set current date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-IN', dateOptions);

    // Fetch database and initialize dashboard
    fetchDashboardData();
});

async function fetchDashboardData() {
    try {
        const response = await fetch('/api/load');
        if (!response.ok) throw new Error('Failed to load database');
        
        const data = await response.json();
        
        // Process KPIs
        updateKPIs(data);
        
        // Process Charts
        renderCharts(data);
        
        // Process Recent Orders Table
        renderRecentOrders(data.orders);
        
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        document.getElementById('kpi-revenue').innerText = 'Error';
        document.getElementById('recent-orders-body').innerHTML = `<tr><td colspan="5" style="text-align: center; color: #dc3545;">Failed to load data</td></tr>`;
    }
}

function updateKPIs(data) {
    let totalRevenue = 0;
    let totalDigitalInvestment = 0;
    let activeLoansCount = 0;

    // Calculate Total Revenue from Approved Orders
    if (data.orders && Array.isArray(data.orders)) {
        data.orders.forEach(order => {
            if (order.status !== 'Declined') {
                // Parse the string amount "₹1,59,964" or use items array
                if (order.items && order.items.length > 0) {
                    order.items.forEach(item => {
                        totalRevenue += (item.totalAmount || 0);
                    });
                } else if (order.totalAmount) {
                    const cleanAmount = order.totalAmount.replace(/[₹,]/g, '').trim();
                    totalRevenue += parseFloat(cleanAmount) || 0;
                }
            }
        });
        document.getElementById('kpi-orders').innerText = data.orders.length;
    }

    // Calculate Digital Investments from Transactions
    if (data.transactions && Array.isArray(data.transactions)) {
        data.transactions.forEach(tx => {
            if (tx.status === 'Approved') {
                const cleanAmount = (tx.amount || '0').replace(/[₹,]/g, '').trim();
                totalDigitalInvestment += parseFloat(cleanAmount) || 0;
            }
        });
    }

    // Count Active Loans
    if (data.loans && Array.isArray(data.loans)) {
        activeLoansCount = data.loans.length; // Assuming all in db are active for now
    }

    // Format Currency
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });

    document.getElementById('kpi-revenue').innerText = formatter.format(totalRevenue);
    document.getElementById('kpi-digital').innerText = formatter.format(totalDigitalInvestment);
    document.getElementById('kpi-loans').innerText = activeLoansCount;
}

function renderCharts(data) {
    // --- 1. Sales Trend Chart (Line) ---
    // Group orders by Date
    const salesByDate = {};
    if (data.orders && Array.isArray(data.orders)) {
        data.orders.forEach(order => {
            if (order.status !== 'Declined') {
                // Parse date string like "8/7/2026, 5:49:34 pm"
                try {
                    const dateStr = order.dateTime.split(',')[0].trim();
                    const dateObj = new Date(dateStr);
                    // Standardize date format YYYY-MM-DD
                    const formattedDate = dateObj.toLocaleDateString('en-CA'); // e.g. 2026-08-07
                    
                    let orderTotal = 0;
                    if (order.items && order.items.length > 0) {
                        order.items.forEach(item => orderTotal += (item.totalAmount || 0));
                    } else if (order.totalAmount) {
                        orderTotal = parseFloat(order.totalAmount.replace(/[₹,]/g, '')) || 0;
                    }

                    if (salesByDate[formattedDate]) {
                        salesByDate[formattedDate] += orderTotal;
                    } else {
                        salesByDate[formattedDate] = orderTotal;
                    }
                } catch(e) {
                    console.error("Error parsing date:", e);
                }
            }
        });
    }

    // Sort dates
    const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(a) - new Date(b));
    const trendLabels = [];
    const trendData = [];
    
    // Take last 7 days of available data
    const recentDates = sortedDates.slice(-7);
    recentDates.forEach(date => {
        trendLabels.push(new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
        trendData.push(salesByDate[date]);
    });

    const ctxTrend = document.getElementById('salesTrendChart').getContext('2d');
    new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: trendLabels.length > 0 ? trendLabels : ['No Data'],
            datasets: [{
                label: 'Revenue (₹)',
                data: trendData.length > 0 ? trendData : [0],
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#d4af37',
                pointRadius: 4,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#888' } },
                x: { grid: { color: 'transparent' }, ticks: { color: '#888' } }
            }
        }
    });

    // --- 2. Revenue by Category (Doughnut) ---
    const categorySales = {};
    if (data.orders && Array.isArray(data.orders)) {
        data.orders.forEach(order => {
            if (order.status !== 'Declined' && order.items) {
                order.items.forEach(item => {
                    const cat = item.category || item.metalType || 'Other';
                    const amount = item.totalAmount || 0;
                    if (categorySales[cat]) {
                        categorySales[cat] += amount;
                    } else {
                        categorySales[cat] = amount;
                    }
                });
            }
        });
    }

    const catLabels = Object.keys(categorySales);
    const catData = Object.values(categorySales);

    // Default colors for jewellery categories
    const backgroundColors = [
        '#d4af37', // Gold
        '#C0C0C0', // Silver
        '#e5e4e2', // Platinum/Diamond
        '#b76e79', // Rose Gold
        '#888888'
    ];

    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: catLabels.length > 0 ? catLabels.map(c => c.charAt(0).toUpperCase() + c.slice(1)) : ['No Data'],
            datasets: [{
                data: catData.length > 0 ? catData : [1],
                backgroundColor: backgroundColors.slice(0, catLabels.length > 0 ? catLabels.length : 1),
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#ccc' } }
            },
            cutout: '70%'
        }
    });
}

function renderRecentOrders(orders) {
    const tbody = document.getElementById('recent-orders-body');
    tbody.innerHTML = ''; // Clear loading

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">No recent orders found.</td></tr>`;
        return;
    }

    // Sort by date descending
    const sortedOrders = [...orders].sort((a, b) => {
        return new Date(b.dateTime.split(',')[0]) - new Date(a.dateTime.split(',')[0]);
    });

    // Take top 5
    const recentOrders = sortedOrders.slice(0, 5);

    recentOrders.forEach(order => {
        const tr = document.createElement('tr');
        
        // Status Badge Class
        let statusClass = 'status-pending';
        let statusText = order.status || 'Pending';
        if (statusText.toLowerCase().includes('approved') || statusText.toLowerCase().includes('transferred')) {
            statusClass = 'status-approved';
        } else if (statusText.toLowerCase() === 'declined' || statusText.toLowerCase() === 'cancelled') {
            statusClass = 'status-declined';
        }

        tr.innerHTML = `
            <td style="color: #d4af37; font-family: monospace;">${order.orderId || 'N/A'}</td>
            <td>
                <div>${order.customerName || 'Unknown'}</div>
                <div style="font-size: 11px; color: #888;">${order.customerEmail || ''}</div>
            </td>
            <td style="color: #ccc; font-size: 13px;">${order.dateTime || 'Unknown'}</td>
            <td style="font-weight: bold;">${order.totalAmount || '₹0'}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        `;
        tbody.appendChild(tr);
    });
}
