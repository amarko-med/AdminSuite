// Orders Module
function initOrdersModule() {
    const ordersTableBody = document.querySelector('#ordersTable tbody');
    const addOrderItemBtn = document.getElementById('addOrderItemBtn');
    const orderItemModal = document.getElementById('orderItemModal');
    const orderItemForm = document.getElementById('orderItemForm');
    const orderProductSelect = document.getElementById('orderProductSelect');
    const orderProductQuantity = document.getElementById('orderProductQuantity');
    const orderTotalEl = document.getElementById('orderTotal');
    const generateInvoiceBtn = document.getElementById('generateInvoice');
    const selectCustomer = document.getElementById('selectCustomer');

    let currentOrderItems = [];

    // Fill product dropdown
    const products = utils.loadFromLocalStorage('products');
    orderProductSelect.innerHTML = '<option value="">Select Product</option>';
    products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.name;
        opt.textContent = `${p.name} ($${parseFloat(p.price).toFixed(2)})`;
        orderProductSelect.appendChild(opt);
    });

    // Fill customer dropdown
    const customers = utils.loadFromLocalStorage('customers');
    selectCustomer.innerHTML = '<option value="">Select Customer</option>';
    customers.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.textContent = c.name;
        selectCustomer.appendChild(opt);
    });

    // Add order item
    addOrderItemBtn.addEventListener('click', () => {
        orderItemForm.reset();
        orderItemModal.style.display = 'flex';
    });

    orderItemForm.addEventListener('submit', e => {
        e.preventDefault();
        const productName = orderProductSelect.value;
        const quantity = parseInt(orderProductQuantity.value, 10);
        const product = products.find(p => p.name === productName);
        if (!product || quantity <= 0) return;

        const subtotal = parseFloat(product.price) * quantity;
        currentOrderItems.push({
            product: product.name,
            price: parseFloat(product.price),
            quantity,
            subtotal
        });

        renderOrderTable();
        orderItemModal.style.display = 'none';
    });

    function renderOrderTable() {
        ordersTableBody.innerHTML = '';
        let total = 0;
        currentOrderItems.forEach((item, idx) => {
            total += item.subtotal;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.product}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${item.subtotal.toFixed(2)}</td>
                <td><button class="btn btn-danger" data-index="${idx}">X</button></td>
            `;
            ordersTableBody.appendChild(row);
        });
        orderTotalEl.textContent = total.toFixed(2);

        // Delete handlers
        ordersTableBody.querySelectorAll('button[data-index]').forEach(btn => {
            btn.addEventListener('click', e => {
                const idx = parseInt(e.target.dataset.index, 10);
                currentOrderItems.splice(idx, 1);
                renderOrderTable();
            });
        });
    }

    // Generate invoice
    generateInvoiceBtn.addEventListener('click', () => {
        const customer = selectCustomer.value;
        if (!customer || currentOrderItems.length === 0) {
            utils.showNotification('Select a customer and add items first!', 'error');
            return;
        }

        const orders = utils.loadFromLocalStorage('orders');
        const newOrder = {
            customer,
            date: new Date().toISOString(),
            items: currentOrderItems,
            total: currentOrderItems.reduce((sum, i) => sum + i.subtotal, 0)
        };

        // Save new order
        orders.push(newOrder);
        utils.saveToLocalStorage('orders', orders);

        utils.showNotification(`Invoice generated for ${newOrder.customer}\nTotal: $${newOrder.total.toFixed(2)}`);

        // Reset current order
        currentOrderItems = [];
        renderOrderTable();

        // Update dashboard
        utils.updateStats();
        updateReportsDashboard();
    });

    // Close modal on background click
    orderItemModal.querySelector('.close').addEventListener('click', () => {
        orderItemModal.style.display = 'none';
    });
    window.addEventListener('click', e => {
        if (e.target === orderItemModal) orderItemModal.style.display = 'none';
    });
}