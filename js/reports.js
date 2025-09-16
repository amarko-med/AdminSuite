// Reports Dashboard Functions
function initReportsDashboard() {
    updateReportsDashboard();
}

function updateReportsDashboard() {
    updateKPIcards();
    updateRecentOrdersTable();
    updateTopProductsTable();
    updateCustomerProfitTable();
    updateCharts();
}

function updateKPIcards() {
    const orders = utils.loadFromLocalStorage('orders');
    const products = utils.loadFromLocalStorage('products');
    
    // Calculate KPIs
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const inventoryValue = products.reduce((sum, product) => sum + (parseFloat(product.price) * parseInt(product.quantity)), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    // Calculate orders this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).length;
    
    // Update KPI cards
    document.getElementById('kpi-total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('kpi-inventory-value').textContent = `$${inventoryValue.toFixed(2)}`;
    document.getElementById('kpi-avg-order').textContent = `$${avgOrderValue.toFixed(2)}`;
    document.getElementById('kpi-month-orders').textContent = monthOrders;
}

function updateRecentOrdersTable() {
    const orders = utils.loadFromLocalStorage('orders');
    const tableBody = document.querySelector('#recentOrdersTable tbody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Get 5 most recent orders
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    // Add rows to table
    recentOrders.forEach(order => {
        const row = document.createElement('tr');
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
        
        row.innerHTML = `
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>${order.customer}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>${totalItems}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Show message if no orders
    if (recentOrders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No recent orders</td></tr>';
    }
}

function updateTopProductsTable() {
    const orders = utils.loadFromLocalStorage('orders');
    const tableBody = document.querySelector('#topProductsTable tbody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Calculate product sales
    const productSales = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!productSales[item.product]) {
                productSales[item.product] = {
                    units: 0,
                    revenue: 0
                };
            }
            
            productSales[item.product].units += item.quantity;
            productSales[item.product].revenue += item.subtotal;
        });
    });
    
    // Convert to array and sort by revenue
    const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    
    // Add rows to table
    topProducts.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.units}</td>
            <td>$${product.revenue.toFixed(2)}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Show message if no products
    if (topProducts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No product sales data</td></tr>';
    }
}

function updateCustomerProfitTable() {
    const orders = utils.loadFromLocalStorage('orders');
    const tableBody = document.querySelector('#customerProfitTable tbody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Calculate customer profitability
    const customerData = {};
    
    orders.forEach(order => {
        if (!customerData[order.customer]) {
            customerData[order.customer] = {
                orders: 0,
                total: 0
            };
        }
        
        customerData[order.customer].orders += 1;
        customerData[order.customer].total += order.total;
    });
    
    // Convert to array
    const customers = Object.entries(customerData)
        .map(([name, data]) => ({ name, ...data }));
    
    // Add rows to table
    customers.forEach(customer => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.orders}</td>
            <td>$${customer.total.toFixed(2)}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Show message if no customers
    if (customers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No customer data</td></tr>';
    }
}

function sortCustomerTable(header) {
    const table = document.getElementById('customerProfitTable');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const sortBy = header.getAttribute('data-sort');
    const isAscending = header.textContent.includes('▴');
    
    // Update header indicator
    header.textContent = header.textContent.replace(/[▴▾]/, '');
    header.textContent += isAscending ? ' ▾' : ' ▴';
    
    // Sort rows
    rows.sort((a, b) => {
        const aValue = a.cells[2].textContent.replace('$', '');
        const bValue = b.cells[2].textContent.replace('$', '');
        
        if (isAscending) {
            return parseFloat(bValue) - parseFloat(aValue);
        } else {
            return parseFloat(aValue) - parseFloat(bValue);
        }
    });
    
    // Clear and re-add rows
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}

function updateCharts() {
    const orders = utils.loadFromLocalStorage('orders');
    const products = utils.loadFromLocalStorage('products');
    
    // Create revenue by month chart
    const monthlyRevenue = {};
    const last6Months = [];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        last6Months.push(monthYear);
        monthlyRevenue[monthYear] = 0;
    }
    
    // Calculate revenue by month
    orders.forEach(order => {
        const orderDate = new Date(order.date);
        const monthYear = `${orderDate.toLocaleString('default', { month: 'short' })} ${orderDate.getFullYear()}`;
        
        if (monthlyRevenue.hasOwnProperty(monthYear)) {
            monthlyRevenue[monthYear] += order.total;
        }
    });
    
    // Create revenue chart
    const revenueCtx = document.getElementById('revenueChart');
    
    if (window.Chart && revenueCtx) {
        // Destroy existing chart if it exists
        if (window.revenueChartInstance) {
            window.revenueChartInstance.destroy();
        }
        
        window.revenueChartInstance = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: last6Months,
                datasets: [{
                    label: 'Revenue',
                    data: last6Months.map(month => monthlyRevenue[month]),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Revenue'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Create revenue by category chart
    const revenueByCategory = {};
    
    // Initialize categories
    const categories = [...new Set(products.map(p => p.type))];
    categories.forEach(category => {
        revenueByCategory[category] = 0;
    });
    
    // Calculate revenue by category
    orders.forEach(order => {
        order.items.forEach(item => {
            const product = products.find(p => p.name === item.product);
            if (product) {
                revenueByCategory[product.type] += item.subtotal;
            }
        });
    });
    
    // Create category chart
    const categoryCtx = document.getElementById('categoryChart');
    
    if (window.Chart && categoryCtx) {
        // Destroy existing chart if it exists
        if (window.categoryChartInstance) {
            window.categoryChartInstance.destroy();
        }
        
        // Generate colors for each category
        const backgroundColors = [
            'rgba(52, 152, 219, 0.7)',
            'rgba(46, 204, 113, 0.7)',
            'rgba(155, 89, 182, 0.7)',
            'rgba(241, 196, 15, 0.7)',
            'rgba(230, 126, 34, 0.7)',
            'rgba(231, 76, 60, 0.7)'
        ];
        
        window.categoryChartInstance = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: categories.map(category => revenueByCategory[category]),
                    backgroundColor: backgroundColors.slice(0, categories.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Revenue by Category'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}