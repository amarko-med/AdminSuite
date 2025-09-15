// Utility functions
const utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        // Force reflow for animation
        void notification.offsetWidth;
        
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 500);
        }, 3000);
    },
    
    validateForm(formData, rules) {
        const errors = {};
        
        for (const field in rules) {
            if (rules[field].required && !formData[field]) {
                errors[field] = `${field} is required`;
            }
            
            if (formData[field] && rules[field].minLength && formData[field].length < rules[field].minLength) {
                errors[field] = `${field} must be at least ${rules[field].minLength} characters`;
            }
            
            if (formData[field] && rules[field].pattern && !rules[field].pattern.test(formData[field])) {
                errors[field] = `${field} is invalid`;
            }
        }
        
        return errors;
    },
    
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            this.showNotification('Error saving data', 'error');
            return false;
        }
    },
    
    loadFromLocalStorage(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return [];
        }
    },
    
    updateStats() {
        const products = this.loadFromLocalStorage('products');
        const customers = this.loadFromLocalStorage('customers');
        const employees = this.loadFromLocalStorage('employees');
        const orders = this.loadFromLocalStorage('orders');
        
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalCustomers').textContent = customers.length;
        document.getElementById('totalEmployees').textContent = employees.length;
        document.getElementById('totalOrders').textContent = orders.length;
    }
};

// Translation functionality
const translations = {
    en: {
        dashboard_title: 'Dashboard',
                logout: 'Logout',
                confirm_logout: 'Are you sure you want to logout?',
                language_changed: 'Language changed to',
                page_reload: 'Page will reload.',
                products: 'Products',
                manage_products: 'Manage your product inventory',
                customers: 'Customers',
                manage_customers: 'Manage customer information',
                employees: 'Employees',
                manage_employees: 'Manage employee records',
                orders: 'Orders',
                manage_orders: 'Process and track orders',
                reports: 'Reports',
                view_reports: 'View business reports',
                search_name: 'Search by name',
                all_types: 'All Types',
                electronics: 'Electronics',
                clothing: 'Clothing',
                food: 'Food',
                add_product: 'Add Product',
                name: 'Name',
                type: 'Type',
                price: 'Price',
                quantity: 'Quantity',
                actions: 'Actions',
                filter_tags: 'Filter by tags',
                add_customer: 'Add Customer',
                email: 'Email',
                tags: 'Tags',
                all_roles: 'All Roles',
                manager: 'Manager',
                developer: 'Developer',
                sales: 'Sales',
                all_departments: 'All Departments',
                hr: 'HR',
                it: 'IT',
                add_employee: 'Add Employee',
                department: 'Department',
                tasks: 'Tasks',
                select_customer: 'Select Customer',
                add_item: 'Add Item',
                generate_invoice: 'Generate Invoice',
                export_json: 'Export JSON',
                product: 'Product',
                subtotal: 'Subtotal',
                total: 'Total',
                total_revenue: 'Total Revenue',
                inventory_value: 'Inventory Value',
                save: 'Save',
                edit: 'Edit',
                delete: 'Delete',
                confirm_delete: 'Are you sure you want to delete this item?',
                select_product: 'Select Product',
                add: 'Add',
                image: 'Image'

    },
    de: {
         dashboard_title: 'Dashboard',
                logout: 'Abmelden',
                confirm_logout: 'Sind Sie sicher, dass Sie sich abmelden möchten?',
                language_changed: 'Sprache geändert zu',
                page_reload: 'Die Seite wird neu geladen.',
                products: 'Produkte',
                manage_products: 'Verwalten Sie Ihr Produktinventar',
                customers: 'Kunden',
                manage_customers: 'Verwalten Sie Kundeninformationen',
                employees: 'Mitarbeiter',
                manage_employees: 'Verwalten Sie Mitarbeiterdatensätze',
                orders: 'Bestellungen',
                manage_orders: 'Bestellungen bearbeiten und verfolgen',
                reports: 'Berichte',
                view_reports: 'Geschäftsberichte anzeigen',
                search_name: 'Nach Namen suchen',
                all_types: 'Alle Typen',
                electronics: 'Elektronik',
                clothing: 'Kleidung',
                food: 'Lebensmittel',
                add_product: 'Produkt hinzufügen',
                name: 'Name',
                type: 'Typ',
                price: 'Preis',
                quantity: 'Menge',
                actions: 'Aktionen',
                filter_tags: 'Nach Tags filtern',
                add_customer: 'Kunden hinzufügen',
                email: 'E-Mail',
                tags: 'Tags',
                all_roles: 'Alle Rollen',
                manager: 'Manager',
                developer: 'Entwickler',
                sales: 'Verkauf',
                all_departments: 'Alle Abteilungen',
                hr: 'Personalabteilung',
                it: 'IT',
                add_employee: 'Mitarbeiter hinzufügen',
                department: 'Abteilung',
                tasks: 'Aufgaben',
                select_customer: 'Kunden auswählen',
                add_item: 'Artikel hinzufügen',
                generate_invoice: 'Rechnung erstellen',
                export_json: 'JSON exportieren',
                product: 'Produkt',
                subtotal: 'Zwischensumme',
                total: 'Gesamt',
                total_revenue: 'Gesamteinnahmen',
                inventory_value: 'Inventarwert',
                save: 'Speichern',
                edit: 'Bearbeiten',
                delete: 'Löschen',
                confirm_delete: 'Sind Sie sicher, dass Sie dieses Element löschen möchten?',
                select_product: 'Produkt auswählen',
                add: 'Hinzufügen',
                image: 'Bild'
    }
};

function getTranslation(key) {
    const lang = localStorage.getItem('language') || 'en';
    return translations[lang][key] || translations['en'][key] || key;
}

function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = translations[lang][key] || translations['en'][key] || key;
    });
    
    // Translate placeholders
    const placeholderElements = document.querySelectorAll('[data-i18n-ph]');
    placeholderElements.forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        el.placeholder = translations[lang][key] || translations['en'][key] || key;
    });
}