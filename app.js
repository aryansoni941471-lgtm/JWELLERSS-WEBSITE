// LAXMINARAYAN JWELLERS - Core JavaScript Logic

// Migrate old admin email to new one in LocalStorage
(function migrateAdminEmail() {
    let usersStr = localStorage.getItem('ljs_users');
    if (usersStr) {
        let users = JSON.parse(usersStr);
        let adminUser = users.find(u => u.email === 'admin@ljs.com');
        if (adminUser) {
            adminUser.email = 'aryansoni941471@gmail.com';
            localStorage.setItem('ljs_users', JSON.stringify(users));
        }
    }
})();

// Global State
let currentRates = {};
let currentInventory = [];
let currentOrders = [];
let currentUser = null;
let cart = [];
let currentSchemes = [];
let currentCustomerSchemes = [];
let currentLoans = [];
let uploadedImageBase64 = '';
let adminSearchQuery = '';
let adminCurrentPage = 1;
const adminItemsPerPage = 8;

// DOM Elements Cache
const elements = {
    splashScreen: document.getElementById('splash-screen'),
    tickerGold24k: document.getElementById('ticker-gold-24k'),
    tickerGold22k: document.getElementById('ticker-gold-22k'),
    tickerSilver: document.getElementById('ticker-silver'),
    
    // Auth & Navigation
    navUserGreeting: document.getElementById('nav-user-greeting'),
    navAuthBtn: document.getElementById('nav-auth-btn'),
    navLogoutBtn: document.getElementById('nav-logout-btn'),
    linkAdmin: document.getElementById('link-admin'),
    
    // Views
    views: {
        home: document.getElementById('home-view'),
        shop: document.getElementById('shop-view'),
        auth: document.getElementById('auth-view'),
        admin: document.getElementById('admin-view'),
        profile: document.getElementById('profile-view'),
        contact: document.getElementById('contact-view'),
        loan: document.getElementById('loan-view')
    },
    
    // Home & Catalog Content
    featuredItemsContainer: document.getElementById('featured-items-container'),
    catalogItemsContainer: document.getElementById('catalog-items-container'),
    catalogItemCount: document.getElementById('catalog-item-count'),
    catalogSort: document.getElementById('catalog-sort'),
    
    // Cart Elements
    cartOverlay: document.getElementById('cart-overlay-wrapper'),
    cartItemsList: document.getElementById('cart-items-list'),
    cartBadgeCount: document.getElementById('cart-badge-count'),
    cartSummaryBase: document.getElementById('cart-summary-base'),
    cartSummaryMaking: document.getElementById('cart-summary-making'),
    cartSummaryGst: document.getElementById('cart-summary-gst'),
    cartSummaryTotal: document.getElementById('cart-summary-total'),
    
    // Auth Page Forms
    tabLoginBtn: document.getElementById('tab-login-btn'),
    tabRegisterBtn: document.getElementById('tab-register-btn'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    loginError: document.getElementById('login-error-msg'),
    registerError: document.getElementById('register-error-msg'),
    registerSuccess: document.getElementById('register-success-msg'),
    
    // Admin Panels
    adminSections: {
        dashboard: document.getElementById('admin-sec-dashboard'),
        inventory: document.getElementById('admin-sec-inventory'),
        rates: document.getElementById('admin-sec-rates'),
        orders: document.getElementById('admin-sec-orders'),
        loans: document.getElementById('admin-sec-loans'),
        approvals: document.getElementById('admin-sec-approvals'),
        schemes: document.getElementById('admin-sec-schemes')
    },
    adminMenuBtns: {
        dashboard: document.getElementById('admin-btn-dashboard'),
        inventory: document.getElementById('admin-btn-inventory'),
        rates: document.getElementById('admin-btn-rates'),
        orders: document.getElementById('admin-btn-orders'),
        loans: document.getElementById('admin-btn-loans'),
        approvals: document.getElementById('admin-btn-approvals'),
        schemes: document.getElementById('admin-btn-schemes')
    },
    
    // Admin Inputs / Forms
    statTotalWeight: document.getElementById('stat-total-weight'),
    statItemCount: document.getElementById('stat-item-count'),
    statOrderCount: document.getElementById('stat-order-count'),
    statTotalRevenue: document.getElementById('stat-total-revenue'),
    statLiveGoldRate: document.getElementById('stat-live-gold-rate'),
    statPendingOrders: document.getElementById('stat-pending-orders'),
    adminRatesForm: document.getElementById('admin-rates-form'),
    rateGold24k: document.getElementById('rate-gold-24k'),
    rateGold22k: document.getElementById('rate-gold-22k'),
    rateSilver: document.getElementById('rate-silver'),
    adminInventoryTableBody: document.getElementById('admin-inventory-table-body'),
    adminOrdersTableBody: document.getElementById('admin-orders-table-body'),
    adminInventorySearch: document.getElementById('admin-inventory-search'),
    adminInventoryPaginationInfo: document.getElementById('admin-inventory-pagination-info'),
    adminPaginationPrev: document.getElementById('admin-pagination-prev'),
    adminPaginationNext: document.getElementById('admin-pagination-next'),
    catalogSearch: document.getElementById('catalog-search'),
    
    // Add/Edit Product Modal
    productModal: document.getElementById('product-modal-wrapper'),
    productModalTitle: document.getElementById('product-modal-title-text'),
    productForm: document.getElementById('admin-product-form'),
    prodFormId: document.getElementById('prod-form-id'),
    prodFormName: document.getElementById('prod-form-name'),
    prodFormCategory: document.getElementById('prod-form-category'),
    prodFormMetal: document.getElementById('prod-form-metal'),
    prodFormWeight: document.getElementById('prod-form-weight'),
    prodFormMaking: document.getElementById('prod-form-making'),
    prodFormStones: document.getElementById('prod-form-stones'),
    prodFormImage: document.getElementById('prod-form-image'),
    prodFormImageSrcRadios: document.getElementsByName('image-source'),
    prodFormImageUrl: document.getElementById('prod-form-image-url'),
    prodFormImageFile: document.getElementById('prod-form-image-file'),
    imageDragDropZone: document.getElementById('image-drag-drop-zone'),
    prodFormImagePreview: document.getElementById('prod-form-image-preview'),
    prodFormImagePreviewInfo: document.getElementById('prod-form-image-preview-info'),
    prodFormDesc: document.getElementById('prod-form-desc'),
    prodFormSubmitBtn: document.getElementById('prod-form-submit-btn'),
    
    // Checkout success modal
    checkoutSuccessModal: document.getElementById('checkout-success-wrapper'),
    successInvoiceSummary: document.getElementById('success-invoice-summary')
};

// -------------------------------------------------------------
// 1. INITIALIZATION & SPLASH TIMER
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State Loading
    loadStateFromStorage();
    
    // 2. Setup Header Rates Tickers
    updateRatesTickerUI();
    
    // 3. Setup Auth UI Buttons / Greets
    updateAuthUI();
    
    // 4. Render Initial Catalog and Featured pieces
    renderFeaturedItems();
    renderShopCatalog();
    
    // 5. Initialize Cart View
    renderCart();

    // 6. Admin Data Populating
    syncAdminDashboard();

    // 7. Splash Screen Timer (Fades out after 2 seconds)
    setTimeout(() => {
        if (elements.splashScreen) {
            elements.splashScreen.classList.add('fade-out');
        }
    }, 2000);

    // 8. Check window location hash for external routes
    const hash = window.location.hash.substring(1);
    if (hash === 'shop') {
        navigateTo('shop');
    } else if (hash === 'admin') {
        navigateTo('admin');
    }

    // 9. Sync with local physical database file (ljs_database.db)
    syncWithDatabaseFile();

    // 10. Wire up Admin panel product image source selector logic
    setupImageSourceControls();
});

// Load variables from LocalStorage
function loadStateFromStorage() {
    currentRates = JSON.parse(localStorage.getItem('ljs_rates')) || initialRates;
    currentInventory = JSON.parse(localStorage.getItem('ljs_inventory')) || initialInventory;
    currentOrders = JSON.parse(localStorage.getItem('ljs_orders')) || [];
    currentSchemes = JSON.parse(localStorage.getItem('ljs_schemes')) || [];
    currentCustomerSchemes = JSON.parse(localStorage.getItem('ljs_customer_schemes')) || [];
    currentLoans = JSON.parse(localStorage.getItem('ljs_loans')) || [];
    
    // Load logged in user
    currentUser = JSON.parse(localStorage.getItem('ljs_current_user')) || null;
    
    // Load shopping cart
    cart = JSON.parse(localStorage.getItem('ljs_cart')) || [];
}

// Save variables to LocalStorage & Sync to disk ljs_database.db
function saveStateToStorage() {
    localStorage.setItem('ljs_rates', JSON.stringify(currentRates));
    localStorage.setItem('ljs_inventory', JSON.stringify(currentInventory));
    localStorage.setItem('ljs_orders', JSON.stringify(currentOrders));
    localStorage.setItem('ljs_current_user', JSON.stringify(currentUser));
    localStorage.setItem('ljs_cart', JSON.stringify(cart));
    localStorage.setItem('ljs_schemes', JSON.stringify(currentSchemes));
    localStorage.setItem('ljs_customer_schemes', JSON.stringify(currentCustomerSchemes));
    localStorage.setItem('ljs_loans', JSON.stringify(currentLoans));

    // Gather full database payload
    const transactions = JSON.parse(localStorage.getItem('ljs_transactions')) || [];
    const dbPayload = {
        rates: currentRates,
        inventory: currentInventory,
        orders: currentOrders,
        users: JSON.parse(localStorage.getItem('ljs_users')) || [],
        transactions: transactions,
        schemes: currentSchemes,
        customerSchemes: currentCustomerSchemes,
        loans: currentLoans
    };

    // Asynchronously write to physical database file on local server disk
    fetch('/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbPayload)
    })
    .then(res => res.json())
    .then(data => console.log("Database file synced successfully:", data))
    .catch(err => console.error("Error saving database file:", err));
}

// REST helper to load database on startup
function syncWithDatabaseFile() {
    fetch('/api/load')
        .then(res => {
            if (res.status === 404) {
                // Database file doesn't exist yet, save current local state to server disk immediately
                saveStateToStorage();
                return null;
            }
            return res.json();
        })
        .then(data => {
            if (data) {
                // Overwrite localStorage with physical database file values
                if (data.rates) localStorage.setItem('ljs_rates', JSON.stringify(data.rates));
                if (data.inventory) localStorage.setItem('ljs_inventory', JSON.stringify(data.inventory));
                if (data.orders) localStorage.setItem('ljs_orders', JSON.stringify(data.orders));
                if (data.users) localStorage.setItem('ljs_users', JSON.stringify(data.users));
                if (data.transactions) localStorage.setItem('ljs_transactions', JSON.stringify(data.transactions));
                if (data.schemes) localStorage.setItem('ljs_schemes', JSON.stringify(data.schemes));
                if (data.customerSchemes) localStorage.setItem('ljs_customer_schemes', JSON.stringify(data.customerSchemes));
                if (data.loans) localStorage.setItem('ljs_loans', JSON.stringify(data.loans));
                
                // Reload states
                loadStateFromStorage();
                
                // Re-render components with latest disk data
                updateRatesTickerUI();
                updateAuthUI();
                renderFeaturedItems();
                renderShopCatalog();
                renderCart();
                syncAdminDashboard();
            }
        })
        .catch(err => console.error("Database connection error:", err));
}

// -------------------------------------------------------------
// 2. SPA ROUTING SYSTEM
// -------------------------------------------------------------
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('mobile-active');
    }
}

function navigateTo(viewId) {
    // Close mobile menu if open
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && navLinks.classList.contains('mobile-active')) {
        navLinks.classList.remove('mobile-active');
    }

    // Restrict staff from accessing any view other than admin
    if (currentUser && currentUser.role === 'staff' && viewId !== 'admin') {
        alert("Staff members are restricted to the Control Room only.");
        return;
    }

    // Protect Admin Route
    if (viewId === 'admin') {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'staff')) {
            // Not authorized, redirect to login tab on auth view
            navigateTo('auth');
            toggleAuthTab('login');
            elements.loginError.style.display = 'block';
            elements.loginError.innerText = "Please log in as an administrator to access the admin panel.";
            return;
        }
    }

    // Toggle active view sections
    Object.keys(elements.views).forEach(key => {
        if (elements.views[key]) {
            if (key === viewId) {
                elements.views[key].classList.add('active');
            } else {
                elements.views[key].classList.remove('active');
            }
        }
    });

    // Update navigation links highlighting
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active-link');
    });

    const activeLink = document.getElementById(`link-${viewId}`);
    if (activeLink) {
        activeLink.classList.add('active-link');
    }

    // Custom view actions
    if (viewId === 'admin') {
        syncAdminDashboard();
    } else if (viewId === 'shop') {
        renderShopCatalog();
    } else if (viewId === 'home') {
        renderFeaturedItems();
    } else if (viewId === 'profile') {
        renderUserProfile();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Helper to filter from home page category card clicks
function filterByCategory(categoryName) {
    navigateTo('shop');
    
    // Uncheck all category filters except selected one
    document.getElementById('filter-cat-all').checked = false;
    document.querySelectorAll('.cat-filter').forEach(checkbox => {
        checkbox.checked = (checkbox.value === categoryName);
    });

    applyFilters();
}

// -------------------------------------------------------------
// 3. DYNAMIC PRICING FORMULA ENGINE
// -------------------------------------------------------------
function getMetalRatePerGram(metalType) {
    switch (metalType) {
        case 'gold24k':
            return currentRates.gold24k / 10;
        case 'gold22k':
            return currentRates.gold22k / 10;
        case 'silver':
            return currentRates.silver / 1000;
        default:
            return 0;
    }
}

// Detailed cost breakdowns for cart calculation
function calculateDetailedPricing(item) {
    const ratePerGram = getMetalRatePerGram(item.metalType);
    const metalCost = item.weight * ratePerGram;
    const baseCost = metalCost + (Number(item.stoneCharges) || 0);
    const makingCost = baseCost * ((Number(item.makingChargesPercent) || 0) / 100);
    const subtotal = baseCost + makingCost;
    const gst = subtotal * 0.03; // 3% Jewellery GST
    const finalPrice = Math.round(subtotal + gst);

    return {
        metalCost,
        baseCost,
        makingCost,
        subtotal,
        gst,
        finalPrice
    };
}

// Simple dynamic price retrieval for listing pages
function getProductPrice(item) {
    const breakdown = calculateDetailedPricing(item);
    return breakdown.finalPrice;
}

// -------------------------------------------------------------
// 4. TICKER RATE BAR RENDER
// -------------------------------------------------------------
function updateRatesTickerUI() {
    if (elements.tickerGold24k) elements.tickerGold24k.innerText = `₹${Number(currentRates.gold24k).toLocaleString('en-IN')}`;
    if (elements.tickerGold22k) elements.tickerGold22k.innerText = `₹${Number(currentRates.gold22k).toLocaleString('en-IN')}`;
    if (elements.tickerSilver) elements.tickerSilver.innerText = `₹${Number(currentRates.silver).toLocaleString('en-IN')}`;
}

// -------------------------------------------------------------
// 5. SHOP CATALOG RENDERING & FILTERING
// -------------------------------------------------------------
function renderFeaturedItems() {
    if (!elements.featuredItemsContainer) return;
    elements.featuredItemsContainer.innerHTML = '';
    
    // Select featured items (max 4)
    const featuredList = currentInventory.filter(item => item.featured).slice(0, 4);
    
    if (featuredList.length === 0) {
        elements.featuredItemsContainer.innerHTML = '<div class="empty-cart-message">No featured items available.</div>';
        return;
    }
    
    featuredList.forEach(item => {
        const finalPrice = getProductPrice(item);
        const cardHTML = createJewelryCardHTML(item, finalPrice);
        elements.featuredItemsContainer.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function createJewelryCardHTML(item, finalPrice) {
    const metalLabel = item.metalType === 'gold22k' ? 'Gold 22K' : (item.metalType === 'gold24k' ? 'Gold 24K' : 'Sterling Silver');
    return `
        <div class="jewelry-card">
            <div class="card-img-wrapper">
                <img src="${item.image}" alt="${item.name}" class="card-img" onerror="this.src='images/gold_ring.png'">
                <span class="card-tag">${metalLabel}</span>
            </div>
            <div class="card-info">
                <h3 class="card-title">${item.name}</h3>
                <div class="card-specifications">
                    <span class="spec-item">Weight: <strong>${item.weight}g</strong></span>
                    <span class="spec-item">Charges: <strong>${item.makingChargesPercent}%</strong></span>
                </div>
                <div class="card-price-row">
                    <div>
                        <span class="card-price">₹${finalPrice.toLocaleString('en-IN')}</span>
                        <span class="card-price-tax-note">incl. GST</span>
                    </div>
                    <button class="add-cart-btn" onclick="addToCart('${item.id}')" aria-label="Add to cart">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Category filter checkbox logic
function handleCategoryFilterChange(checkbox) {
    if (checkbox.checked) {
        // Uncheck all other category checkboxes
        document.querySelectorAll('.cat-filter').forEach(cb => {
            cb.checked = false;
        });
    }
    applyFilters();
}

function applyFilters() {
    if (!elements.catalogItemsContainer) return;
    
    // Check filter values
    const allCatChecked = document.getElementById('filter-cat-all').checked;
    
    // Collect active categories
    const selectedCats = [];
    if (!allCatChecked) {
        document.querySelectorAll('.cat-filter').forEach(cb => {
            if (cb.checked) selectedCats.push(cb.value);
        });
    }
    
    // Collect active metals
    const selectedMetals = [];
    document.querySelectorAll('.metal-filter').forEach(cb => {
        if (cb.checked) selectedMetals.push(cb.value);
    });

    const searchQuery = elements.catalogSearch ? elements.catalogSearch.value.toLowerCase().trim() : '';

    // Filter list
    let filteredList = currentInventory.filter(item => {
        // Category check
        const matchCategory = allCatChecked || selectedCats.length === 0 || selectedCats.includes(item.category);
        // Metal check
        const matchMetal = selectedMetals.length === 0 || selectedMetals.includes(item.metalType);
        // Search query check
        const matchSearch = !searchQuery || 
                            item.name.toLowerCase().includes(searchQuery) || 
                            item.description.toLowerCase().includes(searchQuery);
        
        return matchCategory && matchMetal && matchSearch;
    });

    // Sorting
    const sortVal = elements.catalogSort.value;
    if (sortVal === 'price-asc') {
        filteredList.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sortVal === 'price-desc') {
        filteredList.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    } else if (sortVal === 'weight-desc') {
        filteredList.sort((a, b) => b.weight - a.weight);
    }

    // Render Grid
    elements.catalogItemsContainer.innerHTML = '';
    elements.catalogItemCount.innerText = `Showing ${filteredList.length} products`;
    
    if (filteredList.length === 0) {
        elements.catalogItemsContainer.innerHTML = `
            <div class="empty-cart-message" style="grid-column: span 3; padding: 60px 0;">
                <p>No products found matching your current filter criteria.</p>
            </div>
        `;
        return;
    }

    filteredList.forEach(item => {
        const price = getProductPrice(item);
        const cardHTML = createJewelryCardHTML(item, price);
        elements.catalogItemsContainer.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function renderShopCatalog() {
    applyFilters();
}

// -------------------------------------------------------------
// 6. SHOPPING CART LOGIC
// -------------------------------------------------------------
function toggleCart(isOpen) {
    if (!elements.cartOverlay) return;
    if (isOpen) {
        renderCart();
        elements.cartOverlay.classList.add('active');
    } else {
        elements.cartOverlay.classList.remove('active');
    }
}

function addToCart(itemId) {
    const existing = cart.find(cartItem => cartItem.itemId === itemId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ itemId, quantity: 1 });
    }
    
    saveStateToStorage();
    renderCart();
    
    // Alert or Visual feedback: Flash Cart badge
    elements.cartBadgeCount.style.animation = 'none';
    setTimeout(() => {
        elements.cartBadgeCount.style.animation = 'successPulse 0.5s ease';
    }, 10);
    
    // Automatically open cart to show it was added
    toggleCart(true);
}

function changeCartQty(itemId, amount) {
    const cartItem = cart.find(ci => ci.itemId === itemId);
    if (!cartItem) return;
    
    cartItem.quantity += amount;
    if (cartItem.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        saveStateToStorage();
        renderCart();
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(ci => ci.itemId !== itemId);
    saveStateToStorage();
    renderCart();
}

function renderCart() {
    // 1. Update Badge counts
    const totalQty = cart.reduce((sum, ci) => sum + ci.quantity, 0);
    elements.cartBadgeCount.innerText = totalQty;

    if (!elements.cartItemsList) return;
    elements.cartItemsList.innerHTML = '';

    if (cart.length === 0) {
        elements.cartItemsList.innerHTML = `
            <div class="empty-cart-message">
                <div class="empty-cart-icon">🛒</div>
                <p>Your shopping cart is currently empty.</p>
            </div>
        `;
        // Zero summary
        elements.cartSummaryBase.innerText = "₹0";
        elements.cartSummaryMaking.innerText = "₹0";
        elements.cartSummaryGst.innerText = "₹0";
        elements.cartSummaryTotal.innerText = "₹0";
        return;
    }

    // Totals calculations
    let grandBase = 0;
    let grandMaking = 0;
    let grandGst = 0;
    let grandTotal = 0;

    cart.forEach(cartItem => {
        const product = currentInventory.find(item => item.id === cartItem.itemId);
        if (!product) return;

        const pricing = calculateDetailedPricing(product);
        const lineTotal = pricing.finalPrice * cartItem.quantity;
        
        // Sums
        grandBase += pricing.baseCost * cartItem.quantity;
        grandMaking += pricing.makingCost * cartItem.quantity;
        grandGst += pricing.gst * cartItem.quantity;
        grandTotal += lineTotal;

        const metalLabel = product.metalType === 'gold22k' ? 'Gold 22K' : (product.metalType === 'gold24k' ? 'Gold 24K' : 'Silver');

        const rowHTML = `
            <div class="cart-item">
                <img src="${product.image}" class="cart-item-img" alt="${product.name}" onerror="this.src='images/gold_ring.png'">
                <div class="cart-item-details">
                    <div>
                        <div class="cart-item-name">${product.name}</div>
                        <div class="cart-item-spec">${metalLabel} | ${product.weight}g</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="qty-selector">
                            <button class="qty-btn" onclick="changeCartQty('${product.id}', -1)">-</button>
                            <span class="qty-val">${cartItem.quantity}</span>
                            <button class="qty-btn" onclick="changeCartQty('${product.id}', 1)">+</button>
                        </div>
                        <span class="cart-item-price">₹${(pricing.finalPrice).toLocaleString('en-IN')}</span>
                        <button class="cart-item-remove" onclick="removeFromCart('${product.id}')">Remove</button>
                    </div>
                </div>
            </div>
        `;
        elements.cartItemsList.insertAdjacentHTML('beforeend', rowHTML);
    });

    // Populate billing summaries
    elements.cartSummaryBase.innerText = `₹${Math.round(grandBase).toLocaleString('en-IN')}`;
    elements.cartSummaryMaking.innerText = `₹${Math.round(grandMaking).toLocaleString('en-IN')}`;
    elements.cartSummaryGst.innerText = `₹${Math.round(grandGst).toLocaleString('en-IN')}`;
    elements.cartSummaryTotal.innerText = `₹${Math.round(grandTotal).toLocaleString('en-IN')}`;
}

// checkout details modal helper
function closeCheckoutModal() {
    const modal = document.getElementById('checkout-details-modal-wrapper');
    if (modal) modal.classList.remove('active');
}

function handleCheckoutPaymethodChange() {
    const method = document.getElementById('checkout-paymethod').value;
    const upiContainer = document.getElementById('checkout-upi-container');
    const utrInput = document.getElementById('checkout-utr');
    
    if (method === 'upi') {
        upiContainer.style.display = 'block';
        utrInput.required = true;
    } else {
        upiContainer.style.display = 'none';
        utrInput.required = false;
        utrInput.value = '';
    }
}

// checkout simulated action
function handleCheckout() {
    if (cart.length === 0) return;
    
    // User must be logged in
    if (!currentUser) {
        toggleCart(false);
        navigateTo('auth');
        toggleAuthTab('login');
        elements.loginError.style.display = 'block';
        elements.loginError.innerText = "Please log in to your account first before placing an order.";
        return;
    }

    // Close Cart Sidebar
    toggleCart(false);

    // Reset checkout form and open Details Modal
    const form = document.getElementById('checkout-details-form');
    if (form) {
        form.reset();
        document.getElementById('checkout-upi-container').style.display = 'none';
        document.getElementById('checkout-utr').required = false;
    }
    
    const modal = document.getElementById('checkout-details-modal-wrapper');
    if (modal) modal.classList.add('active');
}

function sendOrderReceipt(order) {
    fetch('/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    }).catch(err => console.error("Error sending receipt:", err));
}

function notifyUserEmail(email, subject, message) {
    if (!email) return;
    fetch('/api/send-status-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message })
    }).catch(err => console.error("Error sending status update email:", err));
}

function submitCheckoutDetailsForm(e) {
    e.preventDefault();
    
    const address = document.getElementById('checkout-address').value.trim();
    const mobile = document.getElementById('checkout-mobile').value.trim();
    const paymethod = document.getElementById('checkout-paymethod').value;
    const utr = document.getElementById('checkout-utr').value.trim();

    // Place Order
    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    
    // Aggregate items detailed descriptions
    const itemsDescriptionList = [];
    const orderItems = [];
    let totalWeight = 0;
    let orderNetTotal = 0;

    cart.forEach(cartItem => {
        const itemObj = currentInventory.find(p => p.id === cartItem.itemId);
        if (itemObj) {
            const pricing = calculateDetailedPricing(itemObj);
            totalWeight += itemObj.weight * cartItem.quantity;
            orderNetTotal += pricing.finalPrice * cartItem.quantity;
            itemsDescriptionList.push(`${itemObj.name} x${cartItem.quantity} (${(itemObj.weight * cartItem.quantity).toFixed(2)}g)`);
            
            orderItems.push({
                id: itemObj.id,
                name: itemObj.name,
                metalType: itemObj.metalType,
                weight: itemObj.weight,
                makingChargesPercent: Number(itemObj.makingChargesPercent) || 0,
                stoneCharges: Number(itemObj.stoneCharges) || 0,
                quantity: cartItem.quantity,
                metalCost: pricing.metalCost,
                baseCost: pricing.baseCost,
                makingCost: pricing.makingCost,
                subtotal: pricing.subtotal,
                gst: pricing.gst,
                finalPrice: pricing.finalPrice,
                totalAmount: pricing.finalPrice * cartItem.quantity
            });
        }
    });

    const newOrder = {
        orderId: orderId,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        itemsSummary: itemsDescriptionList.join(', '),
        items: orderItems,
        totalWeight: totalWeight.toFixed(2) + "g",
        totalAmount: "₹" + orderNetTotal.toLocaleString('en-IN'),
        dateTime: new Date().toLocaleString(),
        status: "Pending",
        address: address,
        mobile: mobile,
        paymentMethod: paymethod === 'cod' ? 'Cash on Delivery (COD)' : (paymethod === 'upi' ? `UPI (UTR: ${utr})` : 'Razorpay Online')
    };

    if (paymethod === 'razorpay') {
        // Fetch config and create order on backend
        fetch('/api/payment-config')
            .then(res => res.json())
            .then(config => {
                const keyId = config.keyId;
                
                return fetch('/api/create-razorpay-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: orderNetTotal })
                })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to create payment order');
                    return res.json();
                })
                .then(rzpOrder => {
                    const options = {
                        key: keyId,
                        amount: rzpOrder.amount,
                        currency: rzpOrder.currency,
                        name: "LAXMINARAYAN JWELLERS",
                        description: "Jewellery Order Payment",
                        order_id: rzpOrder.id,
                        handler: function (response) {
                            // Verify payment signature on backend
                            fetch('/api/verify-razorpay-payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature
                                })
                            })
                            .then(res => res.json())
                            .then(verification => {
                                if (verification.success) {
                                    // Complete the order placement with status "Approved" since payment was verified
                                    const finalOrder = {
                                        ...newOrder,
                                        status: "Approved",
                                        paymentMethod: `Razorpay Online (ID: ${response.razorpay_payment_id})`
                                    };
                                    
                                    currentOrders.unshift(finalOrder);
                                    sendOrderReceipt(finalOrder);
                                    cart = [];
                                    saveStateToStorage();
                                    renderCart();
                                    closeCheckoutModal();
                                    
                                    if (elements.checkoutSuccessModal) {
                                        elements.successInvoiceSummary.innerText = `Your order ${orderId} has been successfully paid via Razorpay (ID: ${response.razorpay_payment_id}). Our jewelry experts will reach out to you shortly for shipping to: ${address}.`;
                                        elements.checkoutSuccessModal.classList.add('active');
                                    }
                                } else {
                                    alert("Payment verification failed! " + verification.error);
                                }
                            })
                            .catch(err => {
                                console.error("Error verifying payment:", err);
                                alert("Failed to verify payment with server.");
                            });
                        },
                        prefill: {
                            name: currentUser.name,
                            email: currentUser.email,
                            contact: mobile
                        },
                        theme: {
                            color: "#d4af37"
                        }
                    };
                    
                    const rzp = new Razorpay(options);
                    rzp.on('payment.failed', function (response) {
                        alert("Payment failed: " + response.error.description);
                    });
                    rzp.open();
                });
            })
            .catch(err => {
                console.error("Payment error:", err);
                alert("An error occurred while initiating online payment.");
            });
            
        return;
    }

    // Default flow for COD / manual UPI
    currentOrders.unshift(newOrder);
    sendOrderReceipt(newOrder);
    cart = [];
    
    saveStateToStorage();
    renderCart();
    closeCheckoutModal();
    
    // Open Success Modal
    if (elements.checkoutSuccessModal) {
        elements.successInvoiceSummary.innerText = `Your order ${orderId} for a total of ${newOrder.totalAmount} has been logged. Our jewelry experts will reach out to you shortly for shipping to: ${address}.`;
        elements.checkoutSuccessModal.classList.add('active');
    }
}

function closeCheckoutSuccess() {
    if (elements.checkoutSuccessModal) {
        elements.checkoutSuccessModal.classList.remove('active');
        navigateTo('shop');
    }
}

// -------------------------------------------------------------
// 7. USER AUTHENTICATION CONTROLS
// -------------------------------------------------------------
function toggleAuthTab(tab) {
    elements.loginError.style.display = 'none';
    elements.registerError.style.display = 'none';
    elements.registerSuccess.style.display = 'none';

    if (tab === 'login') {
        elements.tabLoginBtn.classList.add('active');
        elements.tabRegisterBtn.classList.remove('active');
        elements.loginForm.classList.add('active');
        elements.registerForm.classList.remove('active');
    } else {
        elements.tabLoginBtn.classList.remove('active');
        elements.tabRegisterBtn.classList.add('active');
        elements.loginForm.classList.remove('active');
        elements.registerForm.classList.add('active');
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    
    const users = JSON.parse(localStorage.getItem('ljs_users')) || initialUsers;
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);

    if (matchedUser) {
        if (matchedUser.role === 'staff') {
            currentUser = {
                email: matchedUser.email,
                name: matchedUser.name,
                role: matchedUser.role
            };
            saveStateToStorage();
            updateAuthUI();
            document.getElementById('login-form').reset();
            navigateTo('admin');
            return;
        }

        if (matchedUser.role === 'admin') {
            // Initiate OTP flow
            const loginBtn = document.querySelector('#login-form button[type="submit"]');
            const originalText = loginBtn.innerText;
            loginBtn.innerText = "Sending OTP...";
            loginBtn.disabled = true;

            fetch('/api/send-admin-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: matchedUser.email })
            })
            .then(res => res.json())
            .then(data => {
                loginBtn.innerText = originalText;
                loginBtn.disabled = false;
                if (data.success) {
                    // Show OTP modal and save pending admin email
                    window.pendingAdminLoginUser = matchedUser;
                    document.getElementById('admin-otp-modal-wrapper').classList.add('active');
                } else {
                    elements.loginError.style.display = 'block';
                    elements.loginError.innerText = "Error: " + data.error;
                }
            })
            .catch(err => {
                loginBtn.innerText = originalText;
                loginBtn.disabled = false;
                elements.loginError.style.display = 'block';
                elements.loginError.innerText = "Failed to send OTP.";
            });
            return; // Wait for OTP
        }

        // Authenticate Customer
        currentUser = {
            email: matchedUser.email,
            name: matchedUser.name,
            role: matchedUser.role
        };
        saveStateToStorage();
        updateAuthUI();
        
        // Reset login form inputs
        document.getElementById('login-form').reset();
        
        // Redirect based on role
        if (currentUser.role === 'admin') {
            navigateTo('admin');
        } else {
            navigateTo('home');
        }
    } else {
        // Fail
        elements.loginError.style.display = 'block';
        elements.loginError.innerText = "Invalid email or password combination.";
    }
}

function closeAdminOtpModal() {
    const modal = document.getElementById('admin-otp-modal-wrapper');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('admin-otp-form').reset();
        document.getElementById('admin-otp-error').style.display = 'none';
        window.pendingAdminLoginUser = null;
    }
}

function handleAdminOtpSubmit(e) {
    e.preventDefault();
    const otp = document.getElementById('admin-otp-input').value.trim();
    const errorMsg = document.getElementById('admin-otp-error');
    
    if (!window.pendingAdminLoginUser) {
        errorMsg.style.display = 'block';
        errorMsg.innerText = "Session expired. Please login again.";
        return;
    }

    const submitBtn = document.getElementById('admin-otp-submit-btn');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Verifying...";
    submitBtn.disabled = true;

    fetch('/api/verify-admin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: window.pendingAdminLoginUser.email, otp: otp })
    })
    .then(res => res.json())
    .then(data => {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        
        if (data.success) {
            // Success! Authenticate as admin
            currentUser = {
                email: window.pendingAdminLoginUser.email,
                name: window.pendingAdminLoginUser.name,
                role: window.pendingAdminLoginUser.role
            };
            saveStateToStorage();
            updateAuthUI();
            
            // Clean up UI
            document.getElementById('login-form').reset();
            closeAdminOtpModal();
            
            // Navigate to Admin dashboard
            navigateTo('admin');
        } else {
            errorMsg.style.display = 'block';
            errorMsg.innerText = data.error || "Invalid OTP.";
        }
    })
    .catch(err => {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        errorMsg.style.display = 'block';
        errorMsg.innerText = "Network error. Please try again.";
    });
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const pass = document.getElementById('register-password').value;

    const users = JSON.parse(localStorage.getItem('ljs_users')) || initialUsers;
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
        elements.registerError.style.display = 'block';
        elements.registerError.innerText = "This email is already registered. Try logging in.";
        return;
    }

    // Register User
    const newUser = {
        name,
        email,
        password: pass,
        role: "customer"
    };

    users.push(newUser);
    localStorage.setItem('ljs_users', JSON.stringify(users));

    elements.registerError.style.display = 'none';
    elements.registerSuccess.style.display = 'block';
    elements.registerSuccess.innerText = "Account created successfully! You can now log in.";
    
    // Reset Form
    document.getElementById('register-form').reset();

    // Automatically transition to login tab after 1.5 seconds
    setTimeout(() => {
        toggleAuthTab('login');
        document.getElementById('login-email').value = email;
    }, 1500);
}

function handleLogout() {
    currentUser = null;
    saveStateToStorage();
    updateAuthUI();
    navigateTo('home');
}

function closeAdminOtpModal() {
    document.getElementById('admin-otp-modal-wrapper').classList.remove('active');
    document.getElementById('admin-otp-form').reset();
    document.getElementById('admin-otp-error').style.display = 'none';
    window.pendingAdminLoginUser = null;
}

function handleAdminOtpSubmit(e) {
    e.preventDefault();
    const otp = document.getElementById('admin-otp-input').value.trim();
    const errorDiv = document.getElementById('admin-otp-error');
    const submitBtn = document.getElementById('admin-otp-submit-btn');
    
    if (!window.pendingAdminLoginUser) return;

    submitBtn.innerText = "Verifying...";
    submitBtn.disabled = true;

    fetch('/api/verify-admin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: window.pendingAdminLoginUser.email, otp: otp })
    })
    .then(res => res.json())
    .then(data => {
        submitBtn.innerText = "Verify & Log In";
        submitBtn.disabled = false;
        
        if (data.success) {
            // Complete Login
            currentUser = {
                email: window.pendingAdminLoginUser.email,
                name: window.pendingAdminLoginUser.name,
                role: window.pendingAdminLoginUser.role
            };
            saveStateToStorage();
            updateAuthUI();
            
            document.getElementById('login-form').reset();
            closeAdminOtpModal();
            navigateTo('admin');
        } else {
            errorDiv.style.display = 'block';
            errorDiv.innerText = data.error || "Invalid OTP";
        }
    })
    .catch(err => {
        submitBtn.innerText = "Verify & Log In";
        submitBtn.disabled = false;
        errorDiv.style.display = 'block';
        errorDiv.innerText = "Verification failed.";
    });
}

function submitContactForm(e) {
    e.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const submitBtn = document.getElementById('contact-submit-btn');
    const successMsg = document.getElementById('contact-success-msg');
    const errorMsg = document.getElementById('contact-error-msg');

    submitBtn.innerText = "Sending...";
    submitBtn.disabled = true;
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    fetch('/api/contact-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
    })
    .then(res => res.json())
    .then(data => {
        submitBtn.innerText = "Send Message";
        submitBtn.disabled = false;
        if (data.success) {
            successMsg.style.display = 'block';
            successMsg.innerText = "Your message has been sent successfully! We will contact you soon.";
            document.getElementById('contact-form').reset();
        } else {
            errorMsg.style.display = 'block';
            errorMsg.innerText = "Error: " + data.error;
        }
    })
    .catch(err => {
        submitBtn.innerText = "Send Message";
        submitBtn.disabled = false;
        errorMsg.style.display = 'block';
        errorMsg.innerText = "Failed to send message.";
    });
}



function updateAuthUI() {
    const profileLink = document.getElementById('link-profile');
    const homeLink = document.getElementById('link-home');
    const shopLink = document.getElementById('link-shop');
    const investmentLink = document.getElementById('link-investment');

    if (currentUser) {
        // Logged In
        elements.navUserGreeting.style.display = 'inline';
        const firstName = currentUser.name.split(' ')[0];
        elements.navUserGreeting.innerText = `Namaste, ${firstName}`;
        
        elements.navAuthBtn.style.display = 'none';
        elements.navLogoutBtn.style.display = 'inline-block';
        
        // Show Admin Nav Link if administrator
        if (currentUser.role === 'admin' || currentUser.role === 'staff') {
            elements.linkAdmin.style.display = 'block';
            if (profileLink) profileLink.style.display = 'none';
            
            const role = currentUser.role;
            
            // Hide main navigation links for staff
            if (role === 'staff') {
                if (homeLink) homeLink.style.display = 'none';
                if (shopLink) shopLink.style.display = 'none';
                if (investmentLink) investmentLink.style.display = 'none';
            } else {
                if (homeLink) homeLink.style.display = 'block';
                if (shopLink) shopLink.style.display = 'block';
                if (investmentLink) investmentLink.style.display = 'block';
            }

            if (elements.adminMenuBtns && elements.adminMenuBtns.dashboard) {
                elements.adminMenuBtns.dashboard.style.display = (role === 'admin') ? 'block' : 'none';
                elements.adminMenuBtns.rates.style.display = (role === 'admin') ? 'block' : 'none';
                elements.adminMenuBtns.schemes.style.display = (role === 'admin') ? 'block' : 'none';
                elements.adminMenuBtns.inventory.style.display = (role === 'admin') ? 'block' : 'none';
                elements.adminMenuBtns.orders.style.display = (role === 'admin') ? 'block' : 'none';
                
                elements.adminMenuBtns.approvals.style.display = 'block';
                
                if (role === 'staff') {
                    toggleAdminTab('approvals');
                } else {
                    toggleAdminTab('dashboard');
                }
            }
        } else {
            elements.linkAdmin.style.display = 'none';
            if (profileLink) profileLink.style.display = 'block';
        }
    } else {
        // Logged Out
        elements.navUserGreeting.style.display = 'none';
        elements.navAuthBtn.style.display = 'inline-block';
        elements.navLogoutBtn.style.display = 'none';
        elements.linkAdmin.style.display = 'none';
        if (profileLink) profileLink.style.display = 'none';
    }
}

// -------------------------------------------------------------
// 8. ADMIN DASHBOARD ACTIONS
// -------------------------------------------------------------
function toggleAdminTab(tabId) {
    // Switch Section View
    Object.keys(elements.adminSections).forEach(key => {
        if (elements.adminSections[key]) {
            if (key === tabId) {
                elements.adminSections[key].classList.add('active');
            } else {
                elements.adminSections[key].classList.remove('active');
            }
        }
    });

    // Switch Sidebar Active styling
    Object.keys(elements.adminMenuBtns).forEach(key => {
        if (elements.adminMenuBtns[key]) {
            if (key === tabId) {
                elements.adminMenuBtns[key].classList.add('active');
            } else {
                elements.adminMenuBtns[key].classList.remove('active');
            }
        }
    });

    // Custom tab loaders
    if (tabId === 'inventory') {
        renderAdminInventoryTable();
    } else if (tabId === 'rates') {
        // Populate rates input fields
        elements.rateGold24k.value = currentRates.gold24k;
        elements.rateGold22k.value = currentRates.gold22k;
        elements.rateSilver.value = currentRates.silver;
    } else if (tabId === 'orders') {
        renderAdminOrdersTable();
    } else if (tabId === 'loans') {
        if (typeof renderAdminLoans === 'function') renderAdminLoans();
    } else if (tabId === 'approvals') {
        renderAdminApprovals();
    } else if (tabId === 'dashboard') {
        syncAdminDashboard();
    } else if (tabId === 'schemes') {
        if (typeof renderAdminSchemes === 'function') renderAdminSchemes();
    }
}

function syncAdminDashboard() {
    const totalWeight = currentInventory.reduce((sum, item) => sum + Number(item.weight), 0);
    
    let totalRevenue = 0;
    let pendingCount = 0;
    currentOrders.forEach(ord => {
        if (ord.status === 'Approved' || ord.status === 'Completed' || ord.status === 'Delivered') {
            let numStr = ord.totalAmount.replace(/[^\d.]/g, ''); 
            totalRevenue += parseFloat(numStr) || 0;
        } else if (!ord.status || ord.status === 'Pending') {
            pendingCount++;
        }
    });

    if (elements.statTotalWeight) elements.statTotalWeight.innerText = totalWeight.toFixed(1) + "g";
    if (elements.statItemCount) elements.statItemCount.innerText = currentInventory.length;
    if (elements.statOrderCount) elements.statOrderCount.innerText = currentOrders.length;
    
    if (elements.statTotalRevenue) elements.statTotalRevenue.innerText = `₹${Math.round(totalRevenue).toLocaleString('en-IN')}`;
    if (elements.statPendingOrders) elements.statPendingOrders.innerText = pendingCount;
    if (elements.statLiveGoldRate) {
        elements.statLiveGoldRate.innerText = `₹${Number(currentRates.gold24k).toLocaleString('en-IN')}`;
    }
}

// Rates update submit
function handleRatesUpdateSubmit(e) {
    e.preventDefault();
    const g24 = Number(elements.rateGold24k.value);
    const g22 = Number(elements.rateGold22k.value);
    const sil = Number(elements.rateSilver.value);

    if (isNaN(g24) || isNaN(g22) || isNaN(sil) || g24 <= 0 || g22 <= 0 || sil <= 0) {
        alert("Please enter valid positive numbers for rates.");
        return;
    }

    currentRates.gold24k = g24;
    currentRates.gold22k = g22;
    currentRates.silver = sil;

    saveStateToStorage();
    updateRatesTickerUI();
    alert("Live metal rates updated successfully. Shop prices recalculated.");
    toggleAdminTab('dashboard');
}

// Render Admin Inventory Manage Grid
function renderAdminInventoryTable() {
    if (!elements.adminInventoryTableBody) return;
    elements.adminInventoryTableBody.innerHTML = '';

    // Filter by search query
    let filteredList = currentInventory.filter(item => {
        return !adminSearchQuery ||
               item.name.toLowerCase().includes(adminSearchQuery) ||
               item.category.toLowerCase().includes(adminSearchQuery) ||
               item.metalType.toLowerCase().includes(adminSearchQuery) ||
               item.description.toLowerCase().includes(adminSearchQuery);
    });

    if (filteredList.length === 0) {
        elements.adminInventoryTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 30px;">No matching items found.</td></tr>';
        
        // Update pagination details
        if (elements.adminInventoryPaginationInfo) {
            elements.adminInventoryPaginationInfo.innerText = 'Showing 0-0 of 0 items';
        }
        if (elements.adminPaginationPrev) {
            elements.adminPaginationPrev.disabled = true;
            elements.adminPaginationPrev.style.opacity = '0.5';
            elements.adminPaginationPrev.style.pointerEvents = 'none';
        }
        if (elements.adminPaginationNext) {
            elements.adminPaginationNext.disabled = true;
            elements.adminPaginationNext.style.opacity = '0.5';
            elements.adminPaginationNext.style.pointerEvents = 'none';
        }
        return;
    }

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredList.length / adminItemsPerPage));
    if (adminCurrentPage > totalPages) {
        adminCurrentPage = totalPages;
    }
    if (adminCurrentPage < 1) {
        adminCurrentPage = 1;
    }

    const startIndex = (adminCurrentPage - 1) * adminItemsPerPage;
    const pageItems = filteredList.slice(startIndex, startIndex + adminItemsPerPage);

    pageItems.forEach(item => {
        const price = getProductPrice(item);
        const metalLabel = item.metalType === 'gold22k' ? 'Gold 22K' : (item.metalType === 'gold24k' ? 'Gold 24K' : 'Silver');
        const badgeClass = item.metalType.startsWith('gold') ? 'gold' : 'silver';

        const rowHTML = `
            <tr>
                <td><img src="${item.image}" class="tbl-img" alt="${item.name}" onerror="this.src='images/gold_ring.png'"></td>
                <td style="font-weight: 600;">${item.name}</td>
                <td style="text-transform: capitalize;">${item.category}</td>
                <td>
                    <span class="badge ${badgeClass}">${metalLabel}</span>
                    <br><small style="color:var(--text-secondary)">${item.weight} grams</small>
                </td>
                <td>${item.makingChargesPercent}%</td>
                <td>₹${Number(item.stoneCharges).toLocaleString('en-IN')}</td>
                <td style="color: var(--text-gold); font-weight: 700;">₹${price.toLocaleString('en-IN')}</td>
                <td>
                    <button class="tbl-action-btn edit" onclick="openProductModal(true, '${item.id}')">Edit</button>
                    <button class="tbl-action-btn delete" onclick="deleteProduct('${item.id}')">Delete</button>
                </td>
            </tr>
        `;
        elements.adminInventoryTableBody.insertAdjacentHTML('beforeend', rowHTML);
    });

    // Update pagination controls
    if (elements.adminInventoryPaginationInfo) {
        const endIndex = Math.min(startIndex + adminItemsPerPage, filteredList.length);
        elements.adminInventoryPaginationInfo.innerText = `Showing ${startIndex + 1}-${endIndex} of ${filteredList.length} items`;
    }
    if (elements.adminPaginationPrev) {
        elements.adminPaginationPrev.disabled = (adminCurrentPage === 1);
        elements.adminPaginationPrev.style.opacity = (adminCurrentPage === 1) ? '0.5' : '1';
        elements.adminPaginationPrev.style.pointerEvents = (adminCurrentPage === 1) ? 'none' : 'auto';
    }
    if (elements.adminPaginationNext) {
        elements.adminPaginationNext.disabled = (adminCurrentPage === totalPages);
        elements.adminPaginationNext.style.opacity = (adminCurrentPage === totalPages) ? '0.5' : '1';
        elements.adminPaginationNext.style.pointerEvents = (adminCurrentPage === totalPages) ? 'none' : 'auto';
    }
}

// Search and Pagination helper functions
function handleAdminSearch() {
    if (elements.adminInventorySearch) {
        adminSearchQuery = elements.adminInventorySearch.value.toLowerCase().trim();
    }
    adminCurrentPage = 1;
    renderAdminInventoryTable();
}

function changeAdminPage(direction) {
    adminCurrentPage += direction;
    renderAdminInventoryTable();
}

// Add/Edit Product Modal Controls
function openProductModal(isEdit = false, itemId = null) {
    if (!elements.productModal) return;

    elements.productForm.reset();
    uploadedImageBase64 = ''; // Reset cached base64
    
    // Reset file input label & file picker
    if (elements.prodFormImageFile) elements.prodFormImageFile.value = '';
    
    if (isEdit && itemId) {
        elements.productModalTitle.innerText = "Edit Jewelry Product";
        elements.prodFormSubmitBtn.innerText = "Update Product";
        
        // Find product
        const prod = currentInventory.find(p => p.id === itemId);
        if (prod) {
            elements.prodFormId.value = prod.id;
            elements.prodFormName.value = prod.name;
            elements.prodFormCategory.value = prod.category;
            elements.prodFormMetal.value = prod.metalType;
            elements.prodFormWeight.value = prod.weight;
            elements.prodFormMaking.value = prod.makingChargesPercent;
            elements.prodFormStones.value = prod.stoneCharges;
            elements.prodFormDesc.value = prod.description;
            
            // Set image source selection based on image value
            const imgVal = prod.image || 'images/gold_ring.png';
            if (imgVal.startsWith('data:')) {
                // Base64 file upload
                uploadedImageBase64 = imgVal;
                setFormImageSource('file');
            } else if (imgVal.startsWith('http://') || imgVal.startsWith('https://') || (imgVal.includes('/') && !imgVal.startsWith('images/'))) {
                // Web URL
                elements.prodFormImageUrl.value = imgVal;
                setFormImageSource('url');
            } else {
                // Preset Gallery
                elements.prodFormImage.value = imgVal;
                setFormImageSource('gallery');
            }
        }
    } else {
        elements.productModalTitle.innerText = "Add New Product";
        elements.prodFormSubmitBtn.innerText = "Add to Inventory";
        elements.prodFormId.value = '';
        
        // Default to gallery
        setFormImageSource('gallery');
    }

    elements.productModal.classList.add('active');
}

function closeProductModal() {
    if (elements.productModal) {
        elements.productModal.classList.remove('active');
    }
}

async function handleProductFormSubmit(e) {
    e.preventDefault();
    const id = elements.prodFormId.value;
    const name = elements.prodFormName.value.trim();
    const category = elements.prodFormCategory.value;
    const metalType = elements.prodFormMetal.value;
    const weight = parseFloat(elements.prodFormWeight.value);
    const makingChargesPercent = parseFloat(elements.prodFormMaking.value);
    const stoneCharges = parseFloat(elements.prodFormStones.value) || 0;
    const description = elements.prodFormDesc.value.trim();

    // Determine correct image path/data
    const activeRadio = Array.from(elements.prodFormImageSrcRadios).find(r => r.checked);
    const srcType = activeRadio ? activeRadio.value : 'gallery';
    let image = 'images/gold_ring.png';
    
    if (srcType === 'gallery') {
        image = elements.prodFormImage.value;
    } else if (srcType === 'url') {
        image = elements.prodFormImageUrl.value.trim() || 'images/gold_ring.png';
    } else if (srcType === 'file') {
        image = uploadedImageBase64 || 'images/gold_ring.png';
    }

    // If image is base64 file data, upload it to the server first
    if (srcType === 'file' && image.startsWith('data:')) {
        try {
            // Show loading status in save button
            const originalBtnText = elements.prodFormSubmitBtn.innerText;
            elements.prodFormSubmitBtn.innerText = "Uploading Image...";
            elements.prodFormSubmitBtn.disabled = true;

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base64: image })
            });
            const uploadData = await uploadRes.json();
            
            // Restore button
            elements.prodFormSubmitBtn.innerText = originalBtnText;
            elements.prodFormSubmitBtn.disabled = false;

            if (uploadData.success) {
                image = uploadData.imagePath;
            } else {
                alert("Image upload failed: " + uploadData.error);
                return;
            }
        } catch (err) {
            console.error("Error uploading image:", err);
            alert("Failed to upload image to server.");
            return;
        }
    }

    if (id) {
        // Edit Mode
        const index = currentInventory.findIndex(p => p.id === id);
        if (index !== -1) {
            currentInventory[index] = {
                ...currentInventory[index],
                name,
                category,
                metalType,
                weight,
                makingChargesPercent,
                stoneCharges,
                image,
                description
            };
        }
    } else {
        // Add Mode
        const newId = "ljs-" + Math.floor(1000 + Math.random() * 9000);
        currentInventory.push({
            id: newId,
            name,
            category,
            metalType,
            weight,
            makingChargesPercent,
            stoneCharges,
            image,
            description,
            featured: false
        });
    }

    saveStateToStorage();
    closeProductModal();
    renderAdminInventoryTable();
    syncAdminDashboard();
}

// Image Source Controls logic
function setupImageSourceControls() {
    // 1. Radio toggles
    elements.prodFormImageSrcRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            document.getElementById('image-src-gallery-container').style.display = (val === 'gallery') ? 'block' : 'none';
            document.getElementById('image-src-url-container').style.display = (val === 'url') ? 'block' : 'none';
            document.getElementById('image-src-file-container').style.display = (val === 'file') ? 'block' : 'none';
            
            updateImagePreview();
        });
    });

    // 2. Preset dropdown change
    if (elements.prodFormImage) {
        elements.prodFormImage.addEventListener('change', updateImagePreview);
    }

    // 3. URL input change
    if (elements.prodFormImageUrl) {
        elements.prodFormImageUrl.addEventListener('input', updateImagePreview);
    }

    // 4. File input change
    if (elements.prodFormImageFile) {
        elements.prodFormImageFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            handleSelectedFile(file);
        });
    }

    // 5. Drag & Drop Event Handlers
    if (elements.imageDragDropZone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            elements.imageDragDropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                elements.imageDragDropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            elements.imageDragDropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                elements.imageDragDropZone.classList.remove('dragover');
            }, false);
        });

        elements.imageDragDropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            if (file && file.type.startsWith('image/')) {
                handleSelectedFile(file);
            }
        }, false);
    }

    // 6. Clipboard Paste (Ctrl+V) handler
    document.addEventListener('paste', (e) => {
        // Only trigger paste logic if product modal is active/open
        if (!elements.productModal || !elements.productModal.classList.contains('active')) return;

        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    handleSelectedFile(file);
                    setFormImageSource('file'); // switch active tab to File upload
                }
                break;
            }
        }
    });
}

function handleSelectedFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        uploadedImageBase64 = evt.target.result;
        updateImagePreview();
    };
    reader.readAsDataURL(file);
}

function updateImagePreview() {
    const activeRadio = Array.from(elements.prodFormImageSrcRadios).find(r => r.checked);
    const srcType = activeRadio ? activeRadio.value : 'gallery';
    
    let previewSrc = 'images/gold_ring.png'; // default fallback
    let infoText = 'images/gold_ring.png';

    if (srcType === 'gallery') {
        previewSrc = elements.prodFormImage.value || 'images/gold_ring.png';
        infoText = previewSrc;
    } else if (srcType === 'url') {
        const urlVal = elements.prodFormImageUrl.value.trim();
        if (urlVal) {
            previewSrc = urlVal;
            infoText = urlVal;
        } else {
            previewSrc = 'images/gold_ring.png';
            infoText = 'Please enter a valid URL';
        }
    } else if (srcType === 'file') {
        if (uploadedImageBase64) {
            previewSrc = uploadedImageBase64;
            const file = elements.prodFormImageFile.files[0];
            infoText = file ? `Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)` : 'Base64 Encoded Image';
        } else {
            previewSrc = 'images/gold_ring.png';
            infoText = 'Please select a photo';
        }
    }

    if (elements.prodFormImagePreview) {
        elements.prodFormImagePreview.src = previewSrc;
    }
    if (elements.prodFormImagePreviewInfo) {
        elements.prodFormImagePreviewInfo.innerText = infoText;
    }
}

function setFormImageSource(sourceType) {
    elements.prodFormImageSrcRadios.forEach(radio => {
        if (radio.value === sourceType) {
            radio.checked = true;
            document.getElementById('image-src-gallery-container').style.display = (sourceType === 'gallery') ? 'block' : 'none';
            document.getElementById('image-src-url-container').style.display = (sourceType === 'url') ? 'block' : 'none';
            document.getElementById('image-src-file-container').style.display = (sourceType === 'file') ? 'block' : 'none';
        } else {
            radio.checked = false;
        }
    });
    updateImagePreview();
}

function deleteProduct(itemId) {
    if (confirm("Are you sure you want to delete this jewelry product from inventory?")) {
        currentInventory = currentInventory.filter(item => item.id !== itemId);
        // Also remove from cart if present
        cart = cart.filter(ci => ci.itemId !== itemId);
        
        saveStateToStorage();
        renderAdminInventoryTable();
        syncAdminDashboard();
        renderCart();
    }
}

// Render Placed Orders Log
function renderAdminOrdersTable() {
    if (!elements.adminOrdersTableBody) return;
    elements.adminOrdersTableBody.innerHTML = '';

    if (currentOrders.length === 0) {
        elements.adminOrdersTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 30px;">No simulated customer orders placed yet.</td></tr>';
        return;
    }

    currentOrders.forEach(ord => {
        const status = ord.status || "Approved";
        const badgeColor = status === "Pending" ? "gold" : (status === "Approved" ? "gold" : "silver");
        const rowHTML = `
            <tr>
                <td style="font-weight:700; color: var(--text-gold);">${ord.orderId}</td>
                <td><strong>${ord.customerName}</strong><br><small style="color:var(--text-secondary)">${ord.customerEmail}</small></td>
                <td>${ord.itemsSummary}</td>
                <td>${ord.totalWeight}</td>
                <td style="font-weight:700;">${ord.totalAmount}</td>
                <td>${ord.dateTime}</td>
                <td><span class="badge ${badgeColor}">${status}</span></td>
                <td>
                    <button class="tbl-action-btn edit" onclick="printInvoice('${ord.orderId}')">Print</button>
                    <a href="certificate.html?orderId=${ord.orderId}" target="_blank" class="tbl-action-btn edit" style="margin-left: 5px; text-decoration: none;">Cert</a>
                </td>
            </tr>
        `;
        elements.adminOrdersTableBody.insertAdjacentHTML('beforeend', rowHTML);
    });
}

// Reset localStorage to Mock data
function resetToMockData() {
    if (confirm("This will erase all changes (rates, users, custom items, order logs) and reset to the initial luxury catalog demo. Proceed?")) {
        localStorage.removeItem("ljs_rates");
        localStorage.removeItem("ljs_users");
        localStorage.removeItem("ljs_inventory");
        localStorage.removeItem("ljs_orders");
        localStorage.removeItem("ljs_cart");
        localStorage.removeItem("ljs_current_user");
        localStorage.removeItem("ljs_transactions");
        
        // Reinitialize
        initializeDatabase();
        loadStateFromStorage();
        
        // Refresh Current View
        updateRatesTickerUI();
        updateAuthUI();
        renderFeaturedItems();
        renderCart();
        syncAdminDashboard();
        
        alert("Database successfully reset to initial mock inventory.");
        navigateTo('home');
    }
}

// -------------------------------------------------------------
// 9. PENDING APPROVALS & USER PORTFOLIO SYSTEM
// -------------------------------------------------------------

function renderAdminApprovals() {
    const ordersTable = document.getElementById('admin-pending-orders-table');
    const txTable = document.getElementById('admin-pending-tx-table');
    
    if (ordersTable) {
        ordersTable.innerHTML = '';
        const pendingOrders = currentOrders.filter(ord => ord.status === 'Pending');
        if (pendingOrders.length === 0) {
            ordersTable.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">No pending jewellery orders.</td></tr>';
        } else {
            pendingOrders.forEach(ord => {
                ordersTable.innerHTML += `
                    <tr>
                        <td style="font-weight:700; color: var(--text-gold);">${ord.orderId}</td>
                        <td>
                            <strong>${ord.customerName}</strong><br>
                            <small>${ord.customerEmail}</small><br>
                            <small>📞 ${ord.mobile || ''}</small>
                        </td>
                        <td>
                            ${ord.itemsSummary}<br>
                            <small style="color: var(--text-secondary)">📍 ${ord.address || ''}</small>
                        </td>
                        <td>
                            <span style="font-weight:700;">${ord.totalAmount}</span><br>
                            <small style="color: var(--text-gold); font-size:0.75rem;">${ord.paymentMethod || ''}</small>
                        </td>
                        <td>
                            <button class="tbl-action-btn edit" onclick="approveOrder('${ord.orderId}')">Approve</button>
                            <button class="tbl-action-btn delete" onclick="declineOrder('${ord.orderId}')">Decline</button>
                        </td>
                    </tr>
                `;
            });
        }
    }
    
    if (txTable) {
        txTable.innerHTML = '';
        const allTx = JSON.parse(localStorage.getItem('ljs_transactions')) || [];
        const pendingTx = allTx.filter(t => t.status === 'Pending');
        if (pendingTx.length === 0) {
            txTable.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">No pending digital trade requests.</td></tr>';
        } else {
            pendingTx.forEach(tx => {
                const badgeColor = tx.type === 'buy' ? 'gold' : 'silver';
                txTable.innerHTML += `
                    <tr>
                        <td style="font-weight:700; color: var(--text-gold);">${tx.txId}</td>
                        <td>
                            <strong>${tx.customerName}</strong><br>
                            <small>${tx.customerEmail}</small><br>
                            <small style="color: var(--text-gold); font-size:0.72rem;">${tx.paymentDetails || ''}</small>
                        </td>
                        <td style="text-transform: uppercase;"><span class="badge ${badgeColor}">${tx.type}</span></td>
                        <td><span style="text-transform: capitalize;">${tx.metal}</span> | ${tx.weight}</td>
                        <td style="font-weight:700;">${tx.amount}</td>
                        <td>
                            <button class="tbl-action-btn edit" onclick="approveTransaction('${tx.txId}')">Approve</button>
                            <button class="tbl-action-btn delete" onclick="declineTransaction('${tx.txId}')">Decline</button>
                        </td>
                    </tr>
                `;
            });
        }
    }
}

function approveOrder(orderId) {
    const ord = currentOrders.find(o => o.orderId === orderId);
    if (ord) {
        ord.status = 'Approved';
        saveStateToStorage();
        notifyUserEmail(ord.customerEmail, 'Order Approved', `Great news! Your order ${orderId} has been approved and is being processed.`);
        alert(`Order ${orderId} has been Approved.`);
        renderAdminApprovals();
        syncAdminDashboard();
    }
}

function declineOrder(orderId) {
    const ord = currentOrders.find(o => o.orderId === orderId);
    if (ord) {
        ord.status = 'Declined';
        saveStateToStorage();
        notifyUserEmail(ord.customerEmail, 'Order Declined', `Unfortunately, your order ${orderId} has been declined. Please contact support for more details.`);
        alert(`Order ${orderId} has been Declined.`);
        renderAdminApprovals();
        syncAdminDashboard();
    }
}

function approveTransaction(txId) {
    const allTx = JSON.parse(localStorage.getItem('ljs_transactions')) || [];
    const tx = allTx.find(t => t.txId === txId);
    
    if (tx) {
        // 1. Set Status
        tx.status = 'Approved';
        localStorage.setItem('ljs_transactions', JSON.stringify(allTx));
        
        // 2. Adjust Customer holdings
        const users = JSON.parse(localStorage.getItem('ljs_users')) || [];
        const customer = users.find(u => u.email.toLowerCase() === tx.customerEmail.toLowerCase());
        
        if (customer) {
            // Ensure fields exist
            if (customer.goldBalance === undefined) customer.goldBalance = 0;
            if (customer.silverBalance === undefined) customer.silverBalance = 0;
            
            const weightVal = parseFloat(tx.weight); // parse e.g. "5.5000g"
            
            if (tx.metal === 'gold') {
                if (tx.type === 'buy') {
                    customer.goldBalance += weightVal;
                } else {
                    customer.goldBalance -= weightVal;
                }
            } else if (tx.metal === 'silver') {
                if (tx.type === 'buy') {
                    customer.silverBalance += weightVal;
                } else {
                    customer.silverBalance -= weightVal;
                }
            }
            
            localStorage.setItem('ljs_users', JSON.stringify(users));
            
            // If the transaction customer is the current logged-in user, sync credentials
            if (currentUser && currentUser.email.toLowerCase() === customer.email.toLowerCase()) {
                currentUser.goldBalance = customer.goldBalance;
                currentUser.silverBalance = customer.silverBalance;
                saveStateToStorage();
            }
        }
        
        notifyUserEmail(tx.customerEmail, 'Trade Request Approved', `Your trade request ${txId} for ${tx.weight} of ${tx.metal} has been approved.`);
        alert(`Trade request ${txId} approved. User's digital holdings updated.`);
        renderAdminApprovals();
        syncAdminDashboard();
    }
}

function declineTransaction(txId) {
    const allTx = JSON.parse(localStorage.getItem('ljs_transactions')) || [];
    const tx = allTx.find(t => t.txId === txId);
    
    if (tx) {
        tx.status = 'Declined';
        localStorage.setItem('ljs_transactions', JSON.stringify(allTx));
        notifyUserEmail(tx.customerEmail, 'Trade Request Declined', `Your trade request ${txId} for ${tx.weight} of ${tx.metal} has been declined.`);
        alert(`Trade request ${txId} has been Declined.`);
        renderAdminApprovals();
        syncAdminDashboard();
    }
}

function renderUserProfile() {
    if (!currentUser) return;
    
    // Find the latest asset values from database
    const users = JSON.parse(localStorage.getItem('ljs_users')) || [];
    const customer = users.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase()) || currentUser;
    
    const goldBal = customer.goldBalance || 0;
    const silverBal = customer.silverBalance || 0;
    
    // Values calculations
    const goldRate = currentRates.gold24k / 10;
    const silverRate = currentRates.silver / 1000;
    const goldVal = goldBal * goldRate;
    const silverVal = silverBal * silverRate;
    
    // Fill text fields
    document.getElementById('profile-name-title').innerText = `Namaste, ${customer.name}`;
    document.getElementById('profile-email-badge').innerText = customer.email;
    document.getElementById('profile-gold-bal').innerText = `${goldBal.toFixed(4)}g`;
    document.getElementById('profile-gold-val').innerText = `Current Value: ₹${Math.round(goldVal).toLocaleString('en-IN')}`;
    document.getElementById('profile-silver-bal').innerText = `${silverBal.toFixed(2)}g`;
    document.getElementById('profile-silver-val').innerText = `Current Value: ₹${Math.round(silverVal).toLocaleString('en-IN')}`;
    
    // Render Customer Active Schemes
    const schemesBody = document.getElementById('profile-schemes-table-body');
    if (schemesBody) {
        schemesBody.innerHTML = '';
        const mySchemes = currentCustomerSchemes.filter(sub => sub.customerId.toLowerCase() === customer.email.toLowerCase());
        if (mySchemes.length === 0) {
            schemesBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">You are not enrolled in any Gold Schemes.</td></tr>';
        } else {
            mySchemes.forEach(sub => {
                const isCompleted = sub.paidInstallments >= sub.totalInstallments;
                const progressPct = Math.min(100, Math.round((sub.paidInstallments / sub.totalInstallments) * 100));
                
                schemesBody.innerHTML += `
                    <tr>
                        <td style="font-weight:700; color: var(--text-gold);">${sub.schemeName}</td>
                        <td>${sub.startDate}</td>
                        <td style="font-weight:700;">₹${sub.monthlyEmi.toLocaleString('en-IN')}</td>
                        <td>
                            <div style="width: 100%; background: rgba(255,255,255,0.1); border-radius: 4px; height: 8px; margin-bottom: 5px;">
                                <div style="width: ${progressPct}%; background: var(--gold-primary); height: 100%; border-radius: 4px;"></div>
                            </div>
                            <span style="font-size: 0.75rem; color: var(--text-secondary);">${sub.paidInstallments} / ${sub.totalInstallments} Months Paid</span>
                        </td>
                        <td><span class="badge ${isCompleted ? 'gold' : 'silver'}">${isCompleted ? 'Completed' : 'Active'}</span></td>
                        <td>
                            ${!isCompleted ? `<button class="tbl-action-btn edit" onclick="processCustomerEmi('${sub.id}')">Pay EMI</button>` : `<span style="font-size: 0.8rem; color: var(--gold-light);">Paid Off</span>`}
                        </td>
                    </tr>
                `;
            });
        }
    }
    
    // Render Customer Jewellery Orders List
    const ordersBody = document.getElementById('profile-orders-table-body');
    if (ordersBody) {
        ordersBody.innerHTML = '';
        const myOrders = currentOrders.filter(ord => ord.customerEmail.toLowerCase() === customer.email.toLowerCase());
        if (myOrders.length === 0) {
            ordersBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">You have not placed any orders yet.</td></tr>';
        } else {
            myOrders.forEach(ord => {
                const status = ord.status || "Approved";
                const statusClass = status === 'Pending' ? 'gold' : (status === 'Approved' ? 'gold' : 'silver');
                ordersBody.innerHTML += `
                    <tr>
                        <td style="font-weight:700; color: var(--text-gold);">${ord.orderId}</td>
                        <td>${ord.itemsSummary}</td>
                        <td style="font-weight:700;">${ord.totalAmount}</td>
                        <td>${ord.dateTime.split(',')[0]}</td>
                        <td><span class="badge ${statusClass}">${status}</span></td>
                        <td>
                            <button class="tbl-action-btn edit" onclick="printInvoice('${ord.orderId}')">Print</button>
                            <a href="certificate.html?orderId=${ord.orderId}" target="_blank" class="tbl-action-btn edit" style="margin-left: 5px; text-decoration: none;">Cert</a>
                        </td>
                    </tr>
                `;
            });
        }
    }
    
    // Render Customer Digital Trade Requests List
    const txBody = document.getElementById('profile-tx-table-body');
    if (txBody) {
        txBody.innerHTML = '';
        const allTx = JSON.parse(localStorage.getItem('ljs_transactions')) || [];
        const myTx = allTx.filter(t => t.customerEmail.toLowerCase() === customer.email.toLowerCase());
        if (myTx.length === 0) {
            txBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 20px;">You have no investment history yet.</td></tr>';
        } else {
            myTx.forEach(tx => {
                const typeClass = tx.type === 'buy' ? 'gold' : 'silver';
                const statusClass = tx.status === 'Pending' ? 'gold' : (tx.status === 'Approved' ? 'gold' : 'silver');
                const printBtnHTML = `<button class="tbl-action-btn edit" onclick="printTransaction('${tx.txId}')">Print</button>`;
                txBody.innerHTML += `
                    <tr>
                        <td style="font-weight:700; color: var(--text-gold);">${tx.txId}</td>
                        <td style="text-transform: uppercase;"><span class="badge ${typeClass}">${tx.type}</span></td>
                        <td style="text-transform: capitalize;">${tx.metal}</td>
                        <td>${tx.weight}</td>
                        <td style="font-weight:700;">${tx.amount}</td>
                        <td>${tx.dateTime.split(',')[0]}</td>
                        <td><span class="badge ${statusClass}">${tx.status}</span></td>
                        <td>${printBtnHTML}</td>
                    </tr>
                `;
            });
        }
    }

    // Render Customer Loan Applications List
    const loansBody = document.getElementById('profile-loans-table-body');
    if (loansBody) {
        loansBody.innerHTML = '';
        const myLoans = currentLoans.filter(l => l.customerEmail && l.customerEmail.toLowerCase() === customer.email.toLowerCase());
        if (myLoans.length === 0) {
            loansBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">You have not applied for any loans yet.</td></tr>';
        } else {
            myLoans.forEach(loan => {
                let statusClass = 'silver';
                if (loan.status.includes('Approved')) statusClass = 'gold';
                
                let displayStatus = loan.status;
                let appointmentHtml = '';
                if (loan.status.startsWith('Appointment Scheduled')) {
                    displayStatus = 'Appointment Scheduled';
                    const dateMatch = loan.status.match(/\(([^)]+)\)/);
                    if (dateMatch) {
                        appointmentHtml = `<br><span style="font-size:0.75rem; color:#3498db; display:block; margin-top:5px; text-transform:none;">🕒 ${dateMatch[1]}</span>`;
                    }
                }

                const dateApplied = loan.dateApplied ? loan.dateApplied.split(',')[0] : 'N/A';
                loansBody.innerHTML += `
                    <tr>
                        <td>${dateApplied}</td>
                        <td>${loan.metalType} (${loan.carat})</td>
                        <td>${loan.weight}g</td>
                        <td style="font-weight:700;">₹${loan.amountRequested.toLocaleString('en-IN')}</td>
                        <td>
                            <span class="badge ${statusClass}">${displayStatus}</span>
                            ${appointmentHtml}
                        </td>
                    </tr>
                `;
            });
        }
    }
}

// Indian Currency Number-to-Words converter
function convertNumberToWords(amount) {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

    function numToWords(n) {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + a[n % 10];
        if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + numToWords(n % 100) : '');
        if (n < 100000) return numToWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? ' ' + numToWords(n % 1000) : '');
        if (n < 10000000) return numToWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? ' ' + numToWords(n % 100000) : '');
        return numToWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? ' ' + numToWords(n % 10000000) : '');
    }

    const cleanNum = Math.round(parseFloat(amount.toString().replace(/[^0-9.]/g, '')));
    if (isNaN(cleanNum) || cleanNum === 0) return 'Zero Rupees Only';
    return 'Rupees ' + numToWords(cleanNum).trim() + ' Only';
}

// A4 Printable Invoice Generator
function printInvoice(orderId) {
    const order = currentOrders.find(o => o.orderId === orderId);
    if (!order) {
        alert("Order details not found.");
        return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
        alert("Pop-up blocker is enabled. Please allow pop-ups to print the receipt.");
        return;
    }

    // Get items detailed array
    let items = order.items;
    let subtotalAmount = 0;
    let totalGSTAmount = 0;
    
    if (!items || items.length === 0) {
        // Fallback for older orders (backward compatibility)
        const totalAmtNum = parseInt(order.totalAmount.replace(/[^0-9]/g, '')) || 0;
        const totalWeightNum = parseFloat(order.totalWeight.replace(/[^0-9.]/g, '')) || 0;
        
        // Reverse calculate 3% GST: total = taxable * 1.03 -> taxable = total / 1.03
        const taxable = Math.round(totalAmtNum / 1.03);
        const gstVal = totalAmtNum - taxable;
        
        subtotalAmount = taxable;
        totalGSTAmount = gstVal;

        items = [{
            name: order.itemsSummary,
            metalType: order.itemsSummary.toLowerCase().includes('silver') ? 'silver' : 'gold22k',
            weight: totalWeightNum,
            quantity: 1,
            metalCost: Math.round(taxable * 0.8), // estimate metal as 80%
            stoneCharges: 0,
            makingChargesPercent: 10,
            makingCost: Math.round(taxable * 0.2), // estimate making charge as 20%
            subtotal: taxable,
            gst: gstVal,
            finalPrice: totalAmtNum,
            totalAmount: totalAmtNum
        }];
    } else {
        // Compute sums from saved item details
        items.forEach(item => {
            subtotalAmount += item.subtotal * item.quantity;
            totalGSTAmount += item.gst * item.quantity;
        });
    }

    const cgstAmount = totalGSTAmount / 2;
    const sgstAmount = totalGSTAmount / 2;
    const grandTotalNum = Math.round(subtotalAmount + totalGSTAmount);

    let itemsRowsHTML = '';
    items.forEach((item, idx) => {
        const purityText = item.metalType === 'gold22k' ? '22K Gold (91.6% Fine)' : (item.metalType === 'gold24k' ? '24K Gold (99.9% Fine)' : '925 Sterling Silver');
        const metalCostFormatted = "₹" + Math.round(item.metalCost * item.quantity).toLocaleString('en-IN');
        const stoneChargesFormatted = "₹" + Math.round(item.stoneCharges * item.quantity).toLocaleString('en-IN');
        const makingCostFormatted = `₹${Math.round(item.makingCost * item.quantity).toLocaleString('en-IN')} (${item.makingChargesPercent}%)`;
        const taxableValFormatted = "₹" + Math.round(item.subtotal * item.quantity).toLocaleString('en-IN');
        const gstValFormatted = "₹" + Math.round(item.gst * item.quantity).toLocaleString('en-IN');
        const totalValFormatted = "₹" + Math.round(item.finalPrice * item.quantity).toLocaleString('en-IN');
        const ratePerGram = Math.round(item.metalCost / item.weight);

        itemsRowsHTML += `
            <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>
                    <strong style="color:#111;">${item.name}</strong><br>
                    <small style="color:#666; font-size:10px;">Purity: ${purityText}</small>
                </td>
                <td style="text-align:center;">7113</td>
                <td style="text-align:right;">${(item.weight * item.quantity).toFixed(2)}g</td>
                <td style="text-align:right;">₹${ratePerGram.toLocaleString('en-IN')}</td>
                <td style="text-align:right;">${metalCostFormatted}</td>
                <td style="text-align:right;">${stoneChargesFormatted}</td>
                <td style="text-align:right;">${makingCostFormatted}</td>
                <td style="text-align:right;">${taxableValFormatted}</td>
                <td style="text-align:right;">${gstValFormatted} (3%)</td>
                <td style="text-align:right; font-weight:600; color:#aa7c11;">${totalValFormatted}</td>
            </tr>
        `;
    });

    const amountInWords = convertNumberToWords(grandTotalNum);

    const invoiceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Invoice - ${order.orderId}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Montserrat:wght@400;500;600;700&display=swap');
        
        body {
            font-family: 'Montserrat', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f7;
            color: #2c2c2e;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 11px;
            line-height: 1.5;
        }
        
        .no-print-bar {
            max-width: 800px;
            margin: 15px auto;
            text-align: right;
        }

        .btn-print {
            background: #aa7c11;
            color: #fff;
            padding: 10px 22px;
            border: none;
            border-radius: 4px;
            font-weight: 700;
            cursor: pointer;
            font-family: 'Montserrat', sans-serif;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            transition: 0.3s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .btn-print:hover {
            background: #8b620b;
        }

        .invoice-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto 30px auto;
            padding: 15mm;
            background: #fff;
            box-sizing: border-box;
            border: 3px double #aa7c11;
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .inner-border {
            border: 1px solid #f2e6cb;
            padding: 25px;
            min-height: 260mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #aa7c11;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .company-details h1 {
            font-family: 'Cinzel', serif;
            font-size: 26px;
            font-weight: 700;
            color: #aa7c11;
            margin: 0 0 5px 0;
            letter-spacing: 2px;
        }

        .company-details p {
            margin: 2px 0;
            color: #555;
            font-size: 10px;
        }

        .invoice-meta {
            text-align: right;
        }

        .invoice-meta h2 {
            font-family: 'Cinzel', serif;
            font-size: 20px;
            color: #aa7c11;
            margin: 0 0 10px 0;
            letter-spacing: 1px;
        }

        .invoice-meta p {
            margin: 3px 0;
            font-size: 11px;
            color: #333;
        }

        .details-grid {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            background-color: #fafaf7;
            border: 1px solid #f2e6cb;
            padding: 15px;
            border-radius: 4px;
        }

        .grid-col {
            width: 48%;
        }

        .grid-col h3 {
            margin: 0 0 8px 0;
            font-size: 12px;
            color: #aa7c11;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e5dfd3;
            padding-bottom: 4px;
        }

        .grid-col p {
            margin: 3px 0;
            line-height: 1.6;
            color: #333;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .items-table th {
            background-color: #fdfbf7;
            color: #aa7c11;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.5px;
            border: 1px solid #e5dfd3;
            padding: 8px 4px;
        }

        .items-table td {
            border: 1px solid #e5dfd3;
            padding: 10px 6px;
            font-size: 10.5px;
        }

        .totals-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-top: 15px;
            margin-bottom: 25px;
        }

        .words-and-notes {
            width: 52%;
        }

        .words-block {
            background-color: #fdfbf7;
            border: 1px dashed #aa7c11;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
        }

        .words-block p {
            margin: 0;
            font-style: italic;
            font-weight: 600;
            color: #aa7c11;
        }

        .terms-block ul {
            margin: 0;
            padding-left: 15px;
            color: #666;
            font-size: 9.5px;
            line-height: 1.5;
        }

        .totals-block {
            width: 42%;
        }

        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals-table td {
            border: 1px solid #e5dfd3;
            padding: 7px 10px;
            font-size: 11px;
        }

        .totals-table tr.highlight td {
            font-weight: 700;
            background-color: #fdfbf7;
            color: #aa7c11;
            font-size: 13px;
            border: 2px solid #aa7c11;
        }

        .signatory-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 35px;
            padding-top: 15px;
        }

        .seal-box {
            border: 2px dashed #e2e2e5;
            width: 90px;
            height: 90px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
            font-weight: 700;
            color: #ccc;
            font-size: 9px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .sign-area {
            text-align: right;
            width: 220px;
        }

        .sign-area p {
            margin: 3px 0;
            color: #555;
        }

        .sign-line {
            border-top: 1px solid #333;
            margin-top: 45px;
            padding-top: 5px;
            font-weight: 600;
            color: #222;
            text-align: center;
        }

        .footer-declaration {
            border-top: 1px solid #e5dfd3;
            margin-top: 25px;
            padding-top: 15px;
            text-align: center;
            font-size: 9.5px;
            color: #777;
            line-height: 1.6;
        }

        @media print {
            @page {
                size: A4;
                margin: 0;
            }
            body {
                background-color: #fff;
                margin: 0;
                padding: 0;
            }
            .no-print-bar {
                display: none;
            }
            .invoice-container {
                border: none;
                box-shadow: none;
                margin: 0;
                padding: 10mm;
                width: 100%;
                height: 100%;
                min-height: 297mm;
            }
            .inner-border {
                border: 3px double #aa7c11;
                padding: 15mm;
                min-height: 275mm;
            }
        }
    </style>
</head>
<body>
    <div class="no-print-bar">
        <button class="btn-print" onclick="window.print()">Print Invoice</button>
    </div>
    
    <div class="invoice-container">
        <div class="inner-border">
            <div>
                <!-- 1. Header Section -->
                <div class="header-section">
                    <div class="company-details">
                        <h1>LAXMINARAYAN JWELLERS</h1>
                        <p style="font-weight:600; text-transform:uppercase; color:#aa7c11; letter-spacing:0.5px;">100% BIS Hallmarked Certified Jewellery</p>
                        <p>LAXMINARAYAN Luxury Plaza, Sector 18, Noida, Uttar Pradesh - 201301</p>
                        <p>Tel: +91 92169 53892 | Email: sales@laxminarayanjwellers.com</p>
                        <p><strong>GSTIN:</strong> 09AAAPLJS2026M1Z2 | <strong>PAN:</strong> AAAPL2026M</p>
                    </div>
                    <div class="invoice-meta">
                        <h2>Tax Invoice</h2>
                        <p><strong>Invoice No:</strong> ${order.orderId}</p>
                        <p><strong>Date:</strong> ${order.dateTime}</p>
                        <p><strong>State Code:</strong> 09 (Uttar Pradesh)</p>
                        <p><strong>Status:</strong> <span style="font-weight:700; color:#aa7c11;">${order.status}</span></p>
                    </div>
                </div>

                <!-- 2. Billing details grid -->
                <div class="details-grid">
                    <div class="grid-col">
                        <h3>Billed & Shipped To</h3>
                        <p><strong>${order.customerName}</strong></p>
                        <p>Email: ${order.customerEmail}</p>
                        <p>Phone: ${order.mobile || 'N/A'}</p>
                        <p>Address: ${order.address || 'N/A'}</p>
                    </div>
                    <div class="grid-col">
                        <h3>Payment & Terms</h3>
                        <p>Payment Mode: <strong>${order.paymentMethod}</strong></p>
                        <p>Purity License: BIS-Hallmark-LJS998</p>
                        <p>Standards: 22K (916 Fineness) / 24K (999 Fineness)</p>
                        <p>Currency: INR (₹)</p>
                    </div>
                </div>

                <!-- 3. Items Table -->
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 5%;">S.No</th>
                            <th style="width: 30%; text-align:left;">Item Description</th>
                            <th style="width: 8%;">HSN</th>
                            <th style="width: 8%; text-align:right;">Weight</th>
                            <th style="width: 10%; text-align:right;">Rate/g</th>
                            <th style="width: 10%; text-align:right;">Metal Cost</th>
                            <th style="width: 10%; text-align:right;">Stones</th>
                            <th style="width: 12%; text-align:right;">Making (Cost)</th>
                            <th style="width: 12%; text-align:right;">Taxable Val</th>
                            <th style="width: 10%; text-align:right;">GST (3%)</th>
                            <th style="width: 12%; text-align:right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRowsHTML}
                    </tbody>
                </table>
            </div>

            <div>
                <!-- 4. Totals Section -->
                <div class="totals-section">
                    <div class="words-and-notes">
                        <div class="words-block">
                            <p style="font-size:10px; text-transform:uppercase; color:#777; margin-bottom:3px; font-weight:normal;">Total Amount in Words</p>
                            <p>${amountInWords}</p>
                        </div>
                        <div class="terms-block">
                            <h4>Terms & Conditions:</h4>
                            <ul>
                                <li>All jewelry items are 100% certified hallmarked by the Bureau of Indian Standards (BIS).</li>
                                <li>Weight and purity have been checked and verified in the presence of the customer.</li>
                                <li>Goods once sold will not be returned or exchanged without the original tax invoice and certificate.</li>
                                <li>All disputes are strictly subject to Noida (UP) jurisdiction.</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="totals-block">
                        <table class="totals-table">
                            <tr>
                                <td>Gross Taxable Value</td>
                                <td style="text-align:right; font-weight:500;">₹${Math.round(subtotalAmount).toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>CGST (1.5%)</td>
                                <td style="text-align:right;">₹${Math.round(cgstAmount).toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>SGST (1.5%)</td>
                                <td style="text-align:right;">₹${Math.round(sgstAmount).toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>IGST (0.0%)</td>
                                <td style="text-align:right;">₹0</td>
                            </tr>
                            <tr>
                                <td>Total GST (3% Included)</td>
                                <td style="text-align:right; font-weight:500; color:#aa7c11;">₹${Math.round(totalGSTAmount).toLocaleString('en-IN')}</td>
                            </tr>
                            <tr class="highlight">
                                <td><strong>Grand Total (INR)</strong></td>
                                <td style="text-align:right;"><strong>₹${grandTotalNum.toLocaleString('en-IN')}</strong></td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- 5. Signature Section -->
                <div class="signatory-section">
                    <div class="seal-box">
                        LJS Seal<br>Certified
                    </div>
                    <div class="sign-area">
                        <p>For <strong>LAXMINARAYAN JWELLERS Pvt. Ltd.</strong></p>
                        <div class="sign-line">Authorized Signatory</div>
                    </div>
                </div>

                <!-- 6. Footer Declaration -->
                <div class="footer-declaration">
                    Certified that the particulars given above are true and correct, and that the transaction is backed by BIS-approved gold and silver bullion assets.<br>
                    <div style="margin-top: 15px; display: flex; justify-content: center; align-items: center; gap: 20px;">
                        <a href="#" onclick="printInvoice('${order.orderId}')" style="color: #aa7c11; text-decoration: none; font-size: 0.9rem;">🖨️ Print Invoice</a>
                        <a href="certificate.html?orderId=${order.orderId}" target="_blank" style="color: #aa7c11; text-decoration: none; font-size: 0.9rem; font-weight: bold;">📜 View Certificate</a>
                    </div>
                    <strong>Thank you for your patronage! Visit again.</strong>
                </div>
            </div>
        </div>
    </div>

    <script>
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                window.print();
            }, 600);
        });
    </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
}

// Bullion Vault Transaction Receipt
function printTransaction(txId) {
    const allTx = JSON.parse(localStorage.getItem('ljs_transactions')) || [];
    const tx = allTx.find(t => t.txId === txId);
    if (!tx) {
        alert("Transaction details not found.");
        return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
        alert("Pop-up blocker is enabled. Please allow pop-ups to print the receipt.");
        return;
    }

    const totalAmtNum = parseInt(tx.amount.replace(/[^0-9]/g, '')) || 0;
    const amountInWords = convertNumberToWords(totalAmtNum);
    const voucherTitle = tx.type === 'buy' ? 'Bullion Purchase & Deposit Receipt' : 'Bullion Sale & Withdrawal Voucher';
    const transactionTypeLabel = tx.type === 'buy' ? 'VAULT DEPOSIT' : 'VAULT WITHDRAWAL';
    const descriptionText = tx.type === 'buy' 
        ? `Purchase of physical bullion metal and subsequent safe-custody deposit into LJS digital secure vault account.`
        : `Liquidation of vault bullion metal assets and transfer of funds to user's registered bank/digital address.`;

    const receiptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bullion Receipt - ${tx.txId}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Montserrat:wght@400;500;600;700&display=swap');
        
        body {
            font-family: 'Montserrat', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f7;
            color: #2c2c2e;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 11px;
            line-height: 1.5;
        }

        .no-print-bar {
            max-width: 800px;
            margin: 15px auto;
            text-align: right;
        }

        .btn-print {
            background: #aa7c11;
            color: #fff;
            padding: 10px 22px;
            border: none;
            border-radius: 4px;
            font-weight: 700;
            cursor: pointer;
            font-family: 'Montserrat', sans-serif;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            transition: 0.3s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .btn-print:hover {
            background: #8b620b;
        }

        .invoice-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto 30px auto;
            padding: 15mm;
            background: #fff;
            box-sizing: border-box;
            border: 3px double #aa7c11;
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .inner-border {
            border: 1px solid #f2e6cb;
            padding: 25px;
            min-height: 260mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #aa7c11;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .company-details h1 {
            font-family: 'Cinzel', serif;
            font-size: 26px;
            font-weight: 700;
            color: #aa7c11;
            margin: 0 0 5px 0;
            letter-spacing: 2px;
        }

        .company-details p {
            margin: 2px 0;
            color: #555;
            font-size: 10px;
        }

        .invoice-meta {
            text-align: right;
        }

        .invoice-meta h2 {
            font-family: 'Cinzel', serif;
            font-size: 18px;
            color: #aa7c11;
            margin: 0 0 10px 0;
            letter-spacing: 0.5px;
        }

        .invoice-meta p {
            margin: 3px 0;
            font-size: 11px;
            color: #333;
        }

        .details-grid {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            background-color: #fafaf7;
            border: 1px solid #f2e6cb;
            padding: 15px;
            border-radius: 4px;
        }

        .grid-col {
            width: 48%;
        }

        .grid-col h3 {
            margin: 0 0 8px 0;
            font-size: 12px;
            color: #aa7c11;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e5dfd3;
            padding-bottom: 4px;
        }

        .grid-col p {
            margin: 3px 0;
            line-height: 1.6;
            color: #333;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }

        .items-table th {
            background-color: #fdfbf7;
            color: #aa7c11;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.5px;
            border: 1px solid #e5dfd3;
            padding: 10px 6px;
        }

        .items-table td {
            border: 1px solid #e5dfd3;
            padding: 12px 10px;
            font-size: 11px;
        }

        .words-block {
            background-color: #fdfbf7;
            border: 1px dashed #aa7c11;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 25px;
        }

        .words-block p {
            margin: 0;
            font-style: italic;
            font-weight: 600;
            color: #aa7c11;
        }

        .declaration-block {
            background-color: #fafafb;
            border: 1px solid #ededf0;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 25px;
            font-size: 10px;
            line-height: 1.6;
            color: #555;
        }

        .declaration-block h4 {
            margin: 0 0 5px 0;
            color: #333;
            text-transform: uppercase;
            font-size: 11px;
        }

        .signatory-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 40px;
        }

        .seal-box {
            border: 2px dashed #aa7c11;
            width: 100px;
            height: 100px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
            font-weight: 700;
            color: #aa7c11;
            font-size: 9px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .sign-area {
            text-align: right;
            width: 220px;
        }

        .sign-area p {
            margin: 3px 0;
            color: #555;
        }

        .sign-line {
            border-top: 1px solid #333;
            margin-top: 50px;
            padding-top: 5px;
            font-weight: 600;
            color: #222;
            text-align: center;
        }

        .footer-declaration {
            border-top: 1px solid #e5dfd3;
            margin-top: 30px;
            padding-top: 15px;
            text-align: center;
            font-size: 9.5px;
            color: #777;
        }

        @media print {
            @page {
                size: A4;
                margin: 0;
            }
            body {
                background-color: #fff;
                margin: 0;
                padding: 0;
            }
            .no-print-bar {
                display: none;
            }
            .invoice-container {
                border: none;
                box-shadow: none;
                margin: 0;
                padding: 10mm;
                width: 100%;
                height: 100%;
                min-height: 297mm;
            }
            .inner-border {
                border: 3px double #aa7c11;
                padding: 15mm;
                min-height: 275mm;
            }
        }
    </style>
</head>
<body>
    <div class="no-print-bar">
        <button class="btn-print" onclick="window.print()">Print Voucher</button>
    </div>
    
    <div class="invoice-container">
        <div class="inner-border">
            <div>
                <!-- Header -->
                <div class="header-section">
                    <div class="company-details">
                        <h1>LJS BULLION LTD.</h1>
                        <p style="font-weight:600; text-transform:uppercase; color:#aa7c11; letter-spacing:0.5px;">Secure Digital Vault & Bullion Custody Services</p>
                        <p>LAXMINARAYAN Luxury Plaza, Sector 18, Noida, Uttar Pradesh - 201301</p>
                        <p>Tel: +91 92169 53892 | Email: vault@laxminarayanjwellers.com</p>
                        <p><strong>License:</strong> SECURE-VAULT-LJS09 | <strong>GSTIN:</strong> 09AAAPLJS2026M1Z2</p>
                    </div>
                    <div class="invoice-meta">
                        <h2>Vault Voucher</h2>
                        <p><strong>Voucher No:</strong> ${tx.txId}</p>
                        <p><strong>Date & Time:</strong> ${tx.dateTime}</p>
                        <p><strong>Type:</strong> <span style="font-weight:700; color:#aa7c11; text-transform:uppercase;">${transactionTypeLabel}</span></p>
                    </div>
                </div>

                <!-- Customer & Activity Details -->
                <div class="details-grid">
                    <div class="grid-col">
                        <h3>Vault Account Holder</h3>
                        <p><strong>${tx.customerName}</strong></p>
                        <p>Registered Email: ${tx.customerEmail}</p>
                        <p>Account Status: Active / KYC Verified</p>
                    </div>
                    <div class="grid-col">
                        <h3>Transaction Details</h3>
                        <p>Ref / Payment Info: <strong>${tx.paymentDetails}</strong></p>
                        <p>Execution Status: <span style="font-weight:700; color:#aa7c11;">${tx.status}</span></p>
                        <p>Settlement: Physical Bullion Lockbox Custody</p>
                    </div>
                </div>

                <!-- Transaction Details Table -->
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 10%;">Activity Ref</th>
                            <th style="width: 45%; text-align:left;">Activity Description</th>
                            <th style="width: 15%;">Precious Metal</th>
                            <th style="width: 15%; text-align:right;">Weight Traded</th>
                            <th style="width: 15%; text-align:right;">Gross Settlement Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="text-align:center; font-weight:600;">${tx.txId}</td>
                            <td>
                                <strong>${voucherTitle}</strong><br>
                                <small style="color:#666; font-size:10px;">${descriptionText}</small>
                            </td>
                            <td style="text-align:center; text-transform:uppercase; font-weight:600;">${tx.metal}</td>
                            <td style="text-align:right; font-weight:700;">${tx.weight}</td>
                            <td style="text-align:right; font-weight:700; color:#aa7c11; font-size:12px;">${tx.amount}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Amount in Words -->
                <div class="words-block">
                    <p style="font-size:10px; text-transform:uppercase; color:#777; margin-bottom:3px; font-weight:normal;">Gross Settlement Value in Words</p>
                    <p>${amountInWords}</p>
                </div>

                <!-- Custody Declaration -->
                <div class="declaration-block">
                    <h4>Institutional Grade Custody Certification</h4>
                    LJS Bullion Ltd. certifies that the transaction specified above represents high-purity precious metals (24K Gold 99.9% / Silver 99% Fine) that have been successfully registered under the customer's digital vault profile. For VAULT DEPOSITS, corresponding physical bullion is allocated in institutional-grade vaults under audited safe-custody arrangements. For VAULT WITHDRAWALS, holdings have been liquidated at live market exchange rates.
                </div>
            </div>

            <div>
                <!-- Signature Area -->
                <div class="signatory-section">
                    <div class="seal-box">
                        LJS Vault<br>Audit Seal
                    </div>
                    <div class="sign-area">
                        <p>For <strong>LJS Bullion Ltd.</strong></p>
                        <div class="sign-line">Vault Custodian Officer</div>
                    </div>
                </div>

                <!-- Footer declaration -->
                <div class="footer-declaration">
                    This is a legally binding vault execution voucher. It acts as an official record of holding changes within the LJS secure digital bullion registry.<br>
                    <strong>LJS Bullion Ltd. | Secured Custody | 100% Insured Precious Metals</strong>
                </div>
            </div>
        </div>
    </div>

    <script>
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                window.print();
            }, 600);
        });
    </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
}

// -------------------------------------------------------------
// 12. GOLD SCHEMES MANAGER
// -------------------------------------------------------------

function renderAdminSchemes() {
    const schemesBody = document.getElementById('admin-schemes-table-body');
    const custSchemesBody = document.getElementById('admin-customer-schemes-table-body');
    
    if (!schemesBody || !custSchemesBody) return;

    // Render Active Schemes
    schemesBody.innerHTML = '';
    currentSchemes.forEach(scheme => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${scheme.id}</td>
            <td><strong>${scheme.name}</strong></td>
            <td>${scheme.durationMonths} + ${scheme.bonusMonths} Bonus</td>
            <td style="font-size: 0.85rem; max-width: 200px;">${scheme.description}</td>
            <td>
                <button class="tbl-action-btn delete" onclick="deleteScheme('${scheme.id}')">Delete</button>
            </td>
        `;
        schemesBody.appendChild(tr);
    });
    if (currentSchemes.length === 0) {
        schemesBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No active schemes found.</td></tr>';
    }

    // Render Customer Subscriptions
    custSchemesBody.innerHTML = '';
    currentCustomerSchemes.forEach(sub => {
        const tr = document.createElement('tr');
        const isCompleted = sub.paidInstallments >= sub.totalInstallments;
        tr.innerHTML = `
            <td>${sub.id}</td>
            <td>${sub.customerName}</td>
            <td>${sub.schemeName}</td>
            <td>₹${sub.monthlyEmi.toLocaleString('en-IN')}</td>
            <td>
                <span style="color: ${isCompleted ? 'var(--accent-gold)' : 'var(--text-secondary)'}">
                    ${sub.paidInstallments} / ${sub.totalInstallments}
                </span>
            </td>
            <td>
                ${!isCompleted ? `<button class="tbl-action-btn edit" onclick="markEmiPaid('${sub.id}')">Pay EMI</button>` : '<span style="color: var(--accent-gold);">Completed</span>'}
            </td>
        `;
        custSchemesBody.appendChild(tr);
    });
    if (currentCustomerSchemes.length === 0) {
        custSchemesBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No customer subscriptions found.</td></tr>';
    }
}

function handleCreateSchemeSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('scheme-name').value;
    const duration = parseInt(document.getElementById('scheme-duration').value);
    const bonus = parseInt(document.getElementById('scheme-bonus').value);
    const desc = document.getElementById('scheme-desc').value;
    
    const newScheme = {
        id: "SCH-" + duration + "-" + bonus + "-" + Date.now().toString().slice(-4),
        name: name,
        durationMonths: duration,
        bonusMonths: bonus,
        description: desc
    };
    
    currentSchemes.push(newScheme);
    saveStateToStorage();
    renderAdminSchemes();
    
    document.getElementById('admin-scheme-form').reset();
    document.getElementById('admin-scheme-modal-wrapper').classList.remove('active');
    
    // Auto-create a dummy customer subscription for demonstration purposes
    if (currentCustomerSchemes.length < 5) {
        currentCustomerSchemes.push({
            id: "SUB-" + Date.now().toString().slice(-5),
            customerId: "customer@gmail.com",
            customerName: "Rohan Sharma",
            schemeId: newScheme.id,
            schemeName: newScheme.name,
            monthlyEmi: 2000 + Math.floor(Math.random() * 8000),
            startDate: new Date().toISOString().split('T')[0],
            totalInstallments: duration,
            paidInstallments: 0,
            status: "Active"
        });
        saveStateToStorage();
        renderAdminSchemes();
    }
}

function deleteScheme(id) {
    if (confirm("Are you sure you want to delete this scheme?")) {
        currentSchemes = currentSchemes.filter(s => s.id !== id);
        saveStateToStorage();
        renderAdminSchemes();
    }
}

function markEmiPaid(subId) {
    const sub = currentCustomerSchemes.find(s => s.id === subId);
    if (sub && sub.paidInstallments < sub.totalInstallments) {
        sub.paidInstallments++;
        if (sub.paidInstallments >= sub.totalInstallments) {
            sub.status = "Completed";
            alert(`Scheme Completed for ${sub.customerName}! They have earned their bonus.`);
        }
        saveStateToStorage();
        renderAdminSchemes();
    }
}

// Variable to store the pending EMI payment scheme ID
let currentEmiSchemeId = null;

window.processCustomerEmi = function(subId) {
    if (!currentUser) return;
    const sub = currentCustomerSchemes.find(s => s.id === subId);
    if (!sub) return;
    
    currentEmiSchemeId = subId;
    
    // Populate the modal
    document.getElementById('emi-modal-scheme-name').innerText = sub.schemeName;
    document.getElementById('emi-modal-amount').innerText = `₹${sub.monthlyEmi.toLocaleString('en-IN')}`;
    
    // Show the modal
    document.getElementById('emi-payment-modal-wrapper').classList.add('active');
};

window.closeEmiPaymentModal = function() {
    document.getElementById('emi-payment-modal-wrapper').classList.remove('active');
    currentEmiSchemeId = null;
};

window.confirmEmiPayment = function() {
    if (!currentEmiSchemeId || !currentUser) return;
    
    const sub = currentCustomerSchemes.find(s => s.id === currentEmiSchemeId);
    if (!sub) return;
    
    // Mark as paid
    sub.paidInstallments += 1;
    
    // Mark as completed if done
    if (sub.paidInstallments >= sub.totalInstallments) {
        sub.status = "Completed";
    }
    
    saveStateToStorage();
    if (typeof syncWithDatabaseFile === 'function') syncWithDatabaseFile();
    
    closeEmiPaymentModal();
    alert("Payment Successful! EMI has been credited.");
    renderUserProfile();
};

// ==========================================
// GOLD LOAN SYSTEM
// ==========================================

// Setup Loan Amount & Interest Calculator
const loanMetal = document.getElementById('loan-metal');
const loanCarat = document.getElementById('loan-carat');
const loanWeight = document.getElementById('loan-weight');
const loanAmountInput = document.getElementById('loan-amount');
const loanInterestDisplay = document.getElementById('loan-interest-display');

function calculateLoanAmount() {
    if (!loanWeight || !loanAmountInput || !currentRates.gold24k) return;
    
    const weight = parseFloat(loanWeight.value);
    const metal = loanMetal.value;
    const carat = loanCarat.value;
    const validationMsg = document.getElementById('loan-validation-msg');
    
    if (isNaN(weight) || weight <= 0) {
        if (validationMsg) validationMsg.style.display = 'none';
        if (loanInterestDisplay) loanInterestDisplay.innerText = `₹ 0`;
        return;
    }

    let ratePerGram = 0;
    let purity = 1.0;
    
    if (metal === "Gold") {
        const rate24k_10g = currentRates.gold24k;
        const effectiveRate10g = rate24k_10g - 2000;
        ratePerGram = effectiveRate10g / 10;
        
        if (carat.includes("24K")) purity = 0.95;
        else if (carat.includes("22K")) purity = 0.83;
        else if (carat.includes("18K")) purity = 0.68;
        else purity = 0.83; // fallback
    } else {
        // Silver logic based on user: real rate - 3000
        const rateSilver_1kg = currentRates.silver;
        const effectiveRate1kg = rateSilver_1kg - 3000;
        ratePerGram = effectiveRate1kg / 1000;
        
        if (carat.includes("999")) purity = 0.95; 
        else if (carat.includes("925")) purity = 0.83; 
        else purity = 0.95;
    }
    
    const calculatedAmount = Math.floor(weight * purity * ratePerGram);
    const requestedAmount = parseFloat(loanAmountInput.value);
    
    if (validationMsg) {
        if (isNaN(requestedAmount) || requestedAmount <= 0) {
            validationMsg.style.display = 'none';
        } else {
            validationMsg.style.display = 'block';
            if (requestedAmount <= calculatedAmount - 5000) {
                validationMsg.innerHTML = '<span style="color: #4caf50;">✔️ Eligible for this amount</span>';
            } else {
                validationMsg.innerHTML = '<span style="color: #f44336;">❌ Gold or silver not fullfill to this amount</span>';
            }
        }
    }
    
    if (loanInterestDisplay) {
        const amountToUse = (requestedAmount && requestedAmount > 0 && requestedAmount <= calculatedAmount - 5000) ? requestedAmount : 0;
        const interest = Math.round(amountToUse * 0.015);
        loanInterestDisplay.innerText = `₹ ${interest.toLocaleString('en-IN')}`;
    }
}

if (loanMetal) loanMetal.addEventListener('change', calculateLoanAmount);
if (loanCarat) loanCarat.addEventListener('change', calculateLoanAmount);
if (loanWeight) loanWeight.addEventListener('input', calculateLoanAmount);
if (loanAmountInput) loanAmountInput.addEventListener('input', calculateLoanAmount);


// Handle Application Submit
window.handleLoanApplication = async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('loan-name').value.trim();
    const mobile = document.getElementById('loan-mobile').value.trim();
    const address = document.getElementById('loan-address').value.trim();
    const metal = document.getElementById('loan-metal').value;
    const carat = document.getElementById('loan-carat').value;
    const weight = parseFloat(document.getElementById('loan-weight').value);
    const amount = parseFloat(document.getElementById('loan-amount').value);
    const bankName = document.getElementById('loan-bank-name').value.trim();
    const accNo = document.getElementById('loan-acc-no').value.trim();
    const ifsc = document.getElementById('loan-ifsc').value.trim();
    const photoInput = document.getElementById('loan-photo');
    
    if (photoInput.files.length === 0) {
        alert("Please upload a jewelry photo.");
        return;
    }

    const file = photoInput.files[0];
    const reader = new FileReader();
    
    reader.onloadend = async function() {
        const base64Str = reader.result;
        
        try {
            // Upload photo to backend
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base64: base64Str })
            });
            const uploadData = await uploadRes.json();
            
            if (!uploadData.success) {
                alert("Failed to upload image: " + uploadData.error);
                return;
            }
            
            // Create Loan Record
            const loanId = "LOAN-" + Math.floor(100000 + Math.random() * 900000);
            const newLoan = {
                id: loanId,
                customerEmail: typeof currentUser !== 'undefined' && currentUser ? currentUser.email : null,
                customerName: name,
                mobile: mobile,
                address: address,
                metalType: metal,
                carat: carat,
                weight: weight,
                amountRequested: amount,
                bankName: bankName,
                accNo: accNo,
                ifsc: ifsc,
                monthlyInterestRate: 1.5,
                image: uploadData.imagePath,
                status: "Pending Appointment",
                dateApplied: new Date().toLocaleString()
            };
            
            currentLoans.push(newLoan);
            saveStateToStorage();
            if (typeof syncWithDatabaseFile === 'function') syncWithDatabaseFile();
            
            alert("Loan Application Submitted Successfully! Our staff will contact you shortly to schedule a home verification visit.");
            document.getElementById('loan-application-form').reset();
            loanInterestDisplay.innerText = `₹ 0`;
            navigateTo('home');
            
        } catch (err) {
            console.error("Error submitting loan:", err);
            alert("An error occurred. Please try again.");
        }
    };
    
    reader.readAsDataURL(file);
};

// Admin Render Loans
window.renderAdminLoans = function() {
    const tbody = document.getElementById('admin-loans-table-body');
    if (!tbody) return;
    
    if (currentLoans.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No loan applications found.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = currentLoans.reverse().map(loan => {
        let displayStatus = loan.status;
        let isScheduled = loan.status.startsWith('Appointment Scheduled');
        let appointmentHtml = '';
        if (isScheduled) {
            displayStatus = 'Appointment Scheduled';
            const dateMatch = loan.status.match(/\(([^)]+)\)/);
            if (dateMatch) {
                appointmentHtml = `<br><small style="color:#3498db; font-weight:bold; display:block; margin-top:4px;">🕒 ${dateMatch[1]}</small>`;
            }
        }

        return `
        <tr>
            <td>${loan.dateApplied.split(',')[0]}</td>
            <td>
                <strong>${loan.customerName}</strong><br>
                <small>${loan.mobile}</small><br>
                <small style="color: #bbb;">${loan.address || 'N/A'}</small>
            </td>
            <td>${loan.metalType} (${loan.carat})</td>
            <td>${loan.weight}g</td>
            <td>
                <span style="color: var(--gold-primary); font-weight: bold;">₹${loan.amountRequested.toLocaleString('en-IN')}</span><br>
                <small style="font-size: 0.7rem; color: #888;">Bank: ${loan.bankName || 'N/A'}<br>A/c: ${loan.accNo || 'N/A'}<br>IFSC: ${loan.ifsc || 'N/A'}</small>
            </td>
            <td>
                <a href="${loan.image}" target="_blank">
                    <img src="${loan.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);">
                </a>
            </td>
            <td>
                <span class="status-badge" style="background: ${getLoanStatusColor(loan.status)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                    ${displayStatus}
                </span>
                ${appointmentHtml}
            </td>
            <td>
                <select onchange="updateLoanStatus('${loan.id}', this.value)" style="padding: 4px; background: #222; color: white; border: 1px solid #444; border-radius: 4px;">
                    <option value="">Update Status...</option>
                    <option value="Pending Appointment" ${loan.status === 'Pending Appointment' ? 'selected' : ''}>Pending Appointment</option>
                    <option value="Appointment Scheduled" ${isScheduled ? 'selected' : ''}>Appointment Scheduled</option>
                    <option value="Approved & Money Transferred" ${loan.status === 'Approved & Money Transferred' ? 'selected' : ''}>Approved & Transferred</option>
                    <option value="Rejected" ${loan.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </td>
        </tr>
        `;
    }).join('');
    currentLoans.reverse(); // restore order
};

function getLoanStatusColor(status) {
    if (status.includes("Pending")) return "#f39c12"; // Orange
    if (status.includes("Scheduled")) return "#3498db"; // Blue
    if (status.includes("Approved")) return "#2ecc71"; // Green
    if (status === "Rejected") return "#e74c3c"; // Red
    return "#95a5a6";
}

window.updateLoanStatus = function(loanId, newStatus) {
    if (!newStatus) return;
    
    const loan = currentLoans.find(l => l.id === loanId);
    if (loan) {
        let message = `Your loan application status has been updated to: ${newStatus}.`;
        
        if (newStatus === "Appointment Scheduled") {
            const date = prompt("Enter the Appointment Date & Time (e.g., '15 July 2026, 10:00 AM'):");
            if (date) {
                loan.status = "Appointment Scheduled (" + date + ")";
                message = `Your loan appointment has been scheduled. Our worker will visit your home on: ${date}.`;
            } else {
                renderAdminLoans(); // reset dropdown
                return;
            }
        } else {
            loan.status = newStatus;
            if (newStatus === "Approved & Money Transferred") {
                message = "Your loan application has been approved and the money has been transferred to your registered bank account.";
            } else if (newStatus === "Rejected") {
                message = "Unfortunately, your loan application has been rejected.";
            }
        }
        
        saveStateToStorage();
        if (typeof syncWithDatabaseFile === 'function') syncWithDatabaseFile();
        
        notifyUserEmail(loan.customerEmail, 'Loan Application Update', message);
        
        renderAdminLoans();
        alert("Loan status updated successfully!");
    }
};
