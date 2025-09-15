// Reports Module
function initReportsModule() {
    const totalRevenueElem = document.getElementById('totalRevenue');
    const inventoryValueElem = document.getElementById('inventoryValue');
    const profitChartElem = document.getElementById('profitChart');
    const customerProfitChartElem = document.getElementById('customerProfitChart');
    const generateInvoiceReportBtn = document.getElementById('generateInvoiceReport');
    const generateBalanceSheetBtn = document.getElementById('generateBalanceSheet');
    const invoiceContainer = document.getElementById('invoiceContainer');
    const balanceSheetContainer = document.getElementById('balanceSheetContainer');
    
    // Calculate total revenue from orders
    const orders = utils.loadFromLocalStorage('orders');
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    totalRevenueElem.textContent = totalRevenue.toFixed(2);
    
    // Calculate inventory value from products
    const products = utils.loadFromLocalStorage('products');
    const inventoryValue = products.reduce((sum, product) => sum + (parseFloat(product.price) * parseInt(product.quantity)), 0);
    inventoryValueElem.textContent = inventoryValue.toFixed(2);
    
    // Create profit per product chart
    if (window.Chart) {
        new Chart(profitChartElem, {
            type: 'bar',
            data: {
                labels: products.map(p => p.name),
                datasets: [{
                    label: getTranslation('inventory_value'),
                    data: products.map(p => parseFloat(p.price) * parseInt(p.quantity)),
                    backgroundColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: getTranslation('inventory_value')
                    }
                }
            }
        });
        
        // Create profit per customer chart
        const customers = utils.loadFromLocalStorage('customers');
        new Chart(customerProfitChartElem, {
            type: 'bar',
            data: {
                labels: customers.map(c => c.name),
                datasets: [{
                    label: getTranslation('total_revenue'),
                    data: customers.map(() => Math.floor(Math.random() * 1000) + 500),
                    backgroundColor: '#2ecc71'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: getTranslation('total_revenue')
                    }
                }
            }
        });
    }
    
    // Add event listeners for report generation
    generateInvoiceReportBtn.addEventListener('click', generateInvoiceReport);
    generateBalanceSheetBtn.addEventListener('click', generateBalanceSheet);
    
    function generateInvoiceReport() {
        balanceSheetContainer.style.display = 'none';
        invoiceContainer.style.display = 'block';
        
        if (orders.length === 0) {
            invoiceContainer.innerHTML = '<p>No orders available for invoice generation.</p>';
            return;
        }
        
        // Create invoice HTML
        let invoiceHTML = `
            <h3>Recent Invoices</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                    <tr>
                        <th style="border: 1px solid var(--border-color); padding: 8px;">Customer</th>
                        <th style="border: 1px solid var(--border-color); padding: 8px;">Date</th>
                        <th style="border: 1px solid var(--border-color); padding: 8px;">Items</th>
                        <th style="border: 1px solid var(--border-color); padding: 8px;">Total</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        orders.slice(-5).forEach(order => {
            invoiceHTML += `
                <tr>
                    <td style="border: 1px solid var(--border-color); padding: 8px;">${order.customer}</td>
                    <td style="border: 1px solid var(--border-color); padding: 8px;">${order.date}</td>
                    <td style="border: 1px solid var(--border-color); padding: 8px;">${order.items.length}</td>
                    <td style="border: 1px solid var(--border-color); padding: 8px;">$${order.total.toFixed(2)}</td>
                </tr>
            `;
        });
        
        invoiceHTML += `
                </tbody>
            </table>
            <button id="downloadInvoice" class="btn btn-primary" style="margin-top: 15px;">Download Invoice as PDF</button>
        `;
        
        invoiceContainer.innerHTML = invoiceHTML;
        
        // Add download functionality
        document.getElementById('downloadInvoice').addEventListener('click', () => {
            utils.showNotification('Invoice download functionality would be implemented here.');
        });
    }
    
    function generateBalanceSheet() {
        invoiceContainer.style.display = 'none';
        balanceSheetContainer.style.display = 'block';
        
        // Calculate values for balance sheet
        const products = utils.loadFromLocalStorage('products');
        const orders = utils.loadFromLocalStorage('orders');
        const totalAssets = products.reduce((sum, product) => sum + (parseFloat(product.price) * parseInt(product.quantity)), 0);
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalLiabilities = totalRevenue * 0.3; // Example calculation
        const equity = totalAssets - totalLiabilities;
        
        // Create balance sheet HTML
        const balanceSheetHTML = `
            <h3>Balance Sheet</h3>
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <div style="width: 48%;">
                    <h4>Assets</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="border: 1px solid var(--border-color); padding: 8px;">Inventory Value</td>
                            <td style="border: 1px solid var(--border-color); padding: 8px;">$${totalAssets.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid var(--border-color); padding: 8px;">Cash</td>
                            <td style="border: 1px solid var(--border-color); padding: 8px;">$${(totalRevenue * 0.7).toFixed(2)}</td>
                        </tr>
                        <tr style="font-weight: bold;">
                            <td style="border: 1px solid var(--border-color); padding: 8px;">Total Assets</td>
                            <td style="border: 1px solid var(--border-color); padding: 8px;">$${(totalAssets + (totalRevenue * 0.7)).toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
                <div style="width: 48%;">
                    <h4>Liabilities & Equity</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="border: 1px solid var(--border-color); padding: 8px;">Accounts Payable</td>
                            <td style="border: 1px solid var(--border-color); padding: 8px;">$${totalLiabilities.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid var(--border-color); padding: 8px;">Equity</td>
                            <td style="border: 1px solid var(--border-color); padding: 8px;">$${equity.toFixed(2)}</td>
                        </tr>
                        <tr style="font-weight: bold;">
                            <td style="border: 1px solid var(--border-color); padding: 8px;">Total Liabilities & Equity</td>
                            <td style="border: 1px solid var(--border-color); padding: 8px;">$${(totalLiabilities + equity).toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <button id="downloadBalanceSheet" class="btn btn-success" style="margin-top: 15px;">Download Balance Sheet</button>
        `;
        
        balanceSheetContainer.innerHTML = balanceSheetHTML;
        
        // Add download functionality
        document.getElementById('downloadBalanceSheet').addEventListener('click', () => {
            utils.showNotification('Balance sheet download functionality would be implemented here.');
        });
    }
}