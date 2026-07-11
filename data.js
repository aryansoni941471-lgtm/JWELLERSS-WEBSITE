// LAXMINARAYAN JWELLERS initial datasets and LocalStorage synchronization
const initialRates = {
    gold24k: 72500, // INR per 10 grams
    gold22k: 66500, // INR per 10 grams
    silver: 89000  // INR per 1000 grams (1 kg)
};

const initialUsers = [
    {
        email: "aryansoni941471@gmail.com",
        password: "admin123",
        name: "LAXMINARAYAN Admin",
        role: "admin",
        goldBalance: 0,   // grams
        silverBalance: 0  // grams
    },
    {
        email: "customer@gmail.com",
        password: "customer123",
        name: "Rohan Sharma",
        role: "customer",
        goldBalance: 5.5,   // grams (Initial investment demo)
        silverBalance: 250.0 // grams (Initial investment demo)
    },
    {
        email: "staff@gmail.com",
        password: "staff",
        name: "Shop Cashier",
        role: "staff",
        goldBalance: 0,
        silverBalance: 0
    }
];

const initialSchemes = [
    {
        id: "SCH-11-1",
        name: "11+1 Golden Harvest",
        durationMonths: 11,
        bonusMonths: 1,
        description: "Pay for 11 months and get 1 month installment free."
    }
];

const initialCustomerSchemes = [
    {
        id: "SUB-001",
        customerId: "customer@gmail.com",
        customerName: "Rohan Sharma",
        schemeId: "SCH-11-1",
        schemeName: "11+1 Golden Harvest",
        monthlyEmi: 5000,
        startDate: "2026-06-01",
        totalInstallments: 11,
        paidInstallments: 2,
        status: "Active"
    },
    {
        id: "SUB-002",
        customerId: "aryansoni941471@gmail.com",
        customerName: "LAXMINARAYAN Admin",
        schemeId: "SCH-11-1",
        schemeName: "11+1 Golden Harvest",
        monthlyEmi: 2000,
        startDate: "2026-07-01",
        totalInstallments: 11,
        paidInstallments: 1,
        status: "Active"
    }
];

const initialInventory = [
    {
        id: "ljs-001",
        name: "Royal Diamond Solitaire Ring",
        category: "rings",
        description: "An exquisite 22k gold ring features a brilliant 1-carat round cut diamond, perfect for engagements and special occasions.",
        metalType: "gold22k",
        weight: 6.5, // grams
        makingChargesPercent: 12,
        stoneCharges: 45000, // Diamond cost
        image: "images/gold_ring.png",
        featured: true
    },
    {
        id: "ljs-002",
        name: "Majestic Ruby & Gold Bridal Necklace",
        category: "necklaces",
        description: "A breathtaking bridal necklace crafted in 22k gold, adorned with shimmering round diamonds and rich red Burmese rubies.",
        metalType: "gold22k",
        weight: 38.2, // grams
        makingChargesPercent: 15,
        stoneCharges: 120000,
        image: "images/gold_necklace.png",
        featured: true
    },
    {
        id: "ljs-003",
        name: "Filigree Drop Gold Earrings",
        category: "earrings",
        description: "Delicate 22k gold drop earrings featuring traditional Indian filigree metalwork with elegant dangling freshwater pearls.",
        metalType: "gold22k",
        weight: 8.4, // grams
        makingChargesPercent: 10,
        stoneCharges: 8000,
        image: "images/gold_earrings.png",
        featured: true
    },
    {
        id: "ljs-004",
        name: "Sterling Silver Vintage Chain Bracelet",
        category: "bracelets",
        description: "Handcrafted solid 925 sterling silver chain bracelet with oxidized vintage engravings and a secure safety clasp.",
        metalType: "silver",
        weight: 24.5, // grams
        makingChargesPercent: 8,
        stoneCharges: 1500,
        image: "images/silver_bracelet.png",
        featured: true
    }
];

// Helper to initialize local storage database
function initializeDatabase() {
    if (!localStorage.getItem("ljs_rates")) {
        localStorage.setItem("ljs_rates", JSON.stringify(initialRates));
    }
    if (!localStorage.getItem("ljs_users")) {
        localStorage.setItem("ljs_users", JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem("ljs_inventory")) {
        localStorage.setItem("ljs_inventory", JSON.stringify(initialInventory));
    }
    if (!localStorage.getItem("ljs_orders")) {
        localStorage.setItem("ljs_orders", JSON.stringify([]));
    }
    if (!localStorage.getItem("ljs_transactions")) {
        localStorage.setItem("ljs_transactions", JSON.stringify([]));
    }
    if (!localStorage.getItem("ljs_schemes")) {
        localStorage.setItem("ljs_schemes", JSON.stringify(initialSchemes));
    }
    if (!localStorage.getItem("ljs_customer_schemes")) {
        localStorage.setItem("ljs_customer_schemes", JSON.stringify(initialCustomerSchemes));
    }
}

// Execute database initialization
initializeDatabase();
