// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Smooth transition for theme change
        document.documentElement.style.transition = 'all 0.3s ease';
        
        // Change the icon based on the current mode
        themeIcon.src = document.body.classList.contains('dark-mode') ? 
            'https://cdn.jsdelivr.net/npm/feather-icons@4.29.0/dist/icons/sun.svg' : 
            'https://cdn.jsdelivr.net/npm/feather-icons@4.29.0/dist/icons/moon.svg';
        
        // Save theme preference
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        
        // Update stats with a slight delay to ensure smooth transition
        setTimeout(utils.updateStats, 100);
    });
    
    // Load saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.src = 'https://cdn.jsdelivr.net/npm/feather-icons@4.29.0/dist/icons/sun.svg';
    } else {
        themeIcon.src = 'https://cdn.jsdelivr.net/npm/feather-icons@4.29.0/dist/icons/moon.svg';
    }
    
    // Logout functionality
    document.getElementById('logout').addEventListener('click', () => {
        if (confirm(getTranslation('confirm_logout'))) {
            window.location.href = 'index.html';
        }
    });
    
    // Language selector functionality
    const languageSelect = document.getElementById('language');
    languageSelect.value = localStorage.getItem('language') || 'en';
    languageSelect.addEventListener('change', () => {
        localStorage.setItem('language', languageSelect.value);
        applyTranslations(languageSelect.value);
        utils.showNotification(`${getTranslation('language_changed')} ${languageSelect.value.toUpperCase()}`);
    });
    
    // Initialize sample data if not exists
    if (!localStorage.getItem('products')) {
        utils.saveToLocalStorage('products', [
            { name: 'Laptop', type: 'Electronics', price: '999.99', quantity: 15 },
            { name: 'T-Shirt', type: 'Clothing', price: '19.99', quantity: 50 },
            { name: 'Coffee', type: 'Food', price: '5.99', quantity: 100 }
        ]);
    }
    
    if (!localStorage.getItem('customers')) {
        utils.saveToLocalStorage('customers', [
            { name: 'John Doe', email: 'john@example.com', tags: 'VIP, Regular' },
            { name: 'Jane Smith', email: 'jane@example.com', tags: 'New' }
        ]);
    }
    
    if (!localStorage.getItem('employees')) {
        utils.saveToLocalStorage('employees', [
            { name: 'Mike Johnson', role: 'Manager', department: 'HR', tasks: 'Recruitment' },
            { name: 'Sarah Williams', role: 'Developer', department: 'IT', tasks: 'Frontend Development' }
        ]);
    }

    // Initialize sample orders if not exists
    if (!localStorage.getItem('orders') || utils.loadFromLocalStorage('orders').length === 0) {
        const sampleOrders = [
            {
                customer: "John Doe",
                date: new Date().toISOString(),
                items: [
                    { product: "Laptop", price: 999.99, quantity: 1, subtotal: 999.99 },
                    { product: "T-Shirt", price: 19.99, quantity: 2, subtotal: 39.98 }
                ],
                total: 1039.97
            },
            {
                customer: "Jane Smith",
                date: new Date(Date.now() - 30*24*60*60*1000).toISOString(), // 30 days ago
                items: [
                    { product: "Coffee", price: 5.99, quantity: 5, subtotal: 29.95 }
                ],
                total: 29.95
            }
        ];
        utils.saveToLocalStorage('orders', sampleOrders);
    }
    
    // Update stats
    utils.updateStats();
    
    // Initialize reports dashboard after a short delay to ensure DOM is fully ready
    setTimeout(initReportsDashboard, 100);
    
    // Add refresh button functionality
    document.getElementById('refresh-reports').addEventListener('click', updateReportsDashboard);
    
    // Add sorting functionality to customer table
    document.querySelector('#customerProfitTable .sortable').addEventListener('click', function() {
        sortCustomerTable(this);
    });
    
    // Module toggle functionality
    const modules = {
        products: document.getElementById('productsModule'),
        customers: document.getElementById('customersModule'),
        employees: document.getElementById('employeesModule'),
        orders: document.getElementById('ordersModule'),
        reports: document.getElementById('reportsModule')
    };
    
    const closeButtons = {
        products: document.getElementById('closeProducts'),
        customers: document.getElementById('closeCustomers'),
        employees: document.getElementById('closeEmployees'),
        orders: document.getElementById('closeOrders'),
        reports: document.getElementById('closeReports')
    };
    
    // Add event listeners to tiles
    document.getElementById('products').addEventListener('click', () => openModule('products'));
    document.getElementById('customers').addEventListener('click', () => openModule('customers'));
    document.getElementById('employees').addEventListener('click', () => openModule('employees'));
    document.getElementById('orders').addEventListener('click', () => openModule('orders'));
    document.getElementById('reports').addEventListener('click', () => {
        // Scroll to reports section instead of opening modal
        document.querySelector('.reports-dashboard').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Add event listeners to close buttons
    closeButtons.products.addEventListener('click', () => closeModule('products'));
    closeButtons.customers.addEventListener('click', () => closeModule('customers'));
    closeButtons.employees.addEventListener('click', () => closeModule('employees'));
    closeButtons.orders.addEventListener('click', () => closeModule('orders'));
    closeButtons.reports.addEventListener('click', () => closeModule('reports'));
    
    function openModule(moduleName) {
        modules[moduleName].style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add a slight delay for animation
        setTimeout(() => {
            modules[moduleName].style.opacity = '1';
            modules[moduleName].querySelector('.module-content').style.transform = 'scale(1)';
        }, 10);
        
        // Initialize module data if needed
        if (moduleName === 'products') initProductsModule();
        if (moduleName === 'customers') initCustomersModule();
        if (moduleName === 'employees') initEmployeesModule();
        if (moduleName === 'orders') initOrdersModule();
    }
    
    function closeModule(moduleName) {
        modules[moduleName].style.opacity = '0';
        modules[moduleName].querySelector('.module-content').style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            modules[moduleName].style.display = 'none';
            document.body.style.overflow = 'auto';
            utils.updateStats();
        }, 300);
    }
    
    // Close module when clicking outside
    window.addEventListener('click', (e) => {
        for (const moduleName in modules) {
            if (e.target === modules[moduleName]) {
                closeModule(moduleName);
            }
        }
    });
    
    // Add keyboard support for closing modules
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            for (const moduleName in modules) {
                if (modules[moduleName].style.display === 'block') {
                    closeModule(moduleName);
                    break;
                }
            }
        }
    });
    
    // Apply translations on load
    applyTranslations(localStorage.getItem('language') || 'en');
});