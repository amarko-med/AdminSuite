// Orders Module
function initOrdersModule() {
    const orders = utils.loadFromLocalStorage('orders');
    const ordersTable = document.getElementById('ordersTable').querySelector('tbody');
    const addOrderItemBtn = document.getElementById('addOrderItemBtn');
    const orderItemModal = document.getElementById('orderItemModal');
    const closeModal = orderItemModal.querySelector('.close');
    const orderItemForm = document.getElementById('orderItemForm');
    const orderProductSelect = document.getElementById('orderProductSelect');
    const orderProductQuantity = document.getElementById('orderProductQuantity');
    const selectCustomer = document.getElementById('selectCustomer');
    const orderTotalSpan = document.getElementById('orderTotal');
    const generateInvoiceBtn = document.getElementById('generateInvoice');
    const exportJSONBtn = document.getElementById('exportJSON');
    const modalTitle = document.getElementById('orderItemModalTitle');
    
    let orderItems = [];
    let editingIndex = null;
    
    // Populate customer dropdown
    function populateCustomers() {
        selectCustomer.innerHTML = '<option value="">' + getTranslation('select_customer') + '</option>';
        const customers = utils.loadFromLocalStorage('customers');
        
        customers.forEach(c => {
            const option = document.createElement('option');
            option.value = c.name;
            option.textContent = c.name;
            selectCustomer.appendChild(option);
        });
    }
    
    // Populate product dropdown
    function populateProducts() {
        orderProductSelect.innerHTML = '<option value="">' + getTranslation('select_product') + '</option>';
        const products = utils.loadFromLocalStorage('products');
        
        products.forEach(p => {
            const option = document.createElement('option');
            option.value = p.name;
            option.textContent = `${p.name} - $${p.price}`;
            orderProductSelect.appendChild(option);
        });
    }
    
    // Open modal
    addOrderItemBtn.addEventListener('click', () => {
        editingIndex = null;
        orderItemForm.reset();
        orderItemModal.style.display = 'flex';
        modalTitle.textContent = getTranslation('add_product');
        populateProducts();
    });
    
    // Close modal
    closeModal.addEventListener('click', () => orderItemModal.style.display = 'none');
    window.addEventListener('click', e => { 
        if(e.target === orderItemModal) orderItemModal.style.display = 'none'; 
    });
    
    // Save order item
    orderItemForm.addEventListener('submit', e => {
        e.preventDefault();
        const productName = orderProductSelect.value;
        const quantity = parseInt(orderProductQuantity.value);
        
        if(!productName) {
            utils.showNotification('Please select a product', 'error');
            return;
        }
        
        const products = utils.loadFromLocalStorage('products');
        const product = products.find(p => p.name === productName);
        
        if(!product) {
            utils.showNotification('Product not found', 'error');
            return;
        }
        
        if (quantity > parseInt(product.quantity)) {
            utils.showNotification(`Only ${product.quantity} items available in stock`, 'error');
            return;
        }
        
        const item = {
            product: product.name,
            price: parseFloat(product.price),
            quantity: quantity,
            subtotal: parseFloat(product.price) * quantity
        };
        
        if(editingIndex !== null) {
            orderItems[editingIndex] = item;
            utils.showNotification('Order item updated successfully');
        } else {
            orderItems.push(item);
            utils.showNotification('Order item added successfully');
        }
        
        renderTable();
        orderItemModal.style.display = 'none';
    });
    
    // Render table
    function renderTable() {
        ordersTable.innerHTML = '';
        let total = 0;
        
        orderItems.forEach((item, index) => {
            const row = ordersTable.insertRow();
            row.dataset.index = index;
            row.innerHTML = `
                <td>${item.product}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${item.subtotal.toFixed(2)}</td>
                <td class="actions">
                    <button class="edit"><i class="fas fa-edit"></i> ${getTranslation('edit')}</button>
                    <button class="delete"><i class="fas fa-trash"></i> ${getTranslation('delete')}</button>
                </td>
            `;
            total += item.subtotal;
        });
        
        orderTotalSpan.textContent = total.toFixed(2);
    }
    
    // Edit/Delete
    ordersTable.addEventListener('click', e => {
        const row = e.target.closest('tr'); 
        if(!row) return;
        
        const index = parseInt(row.dataset.index);
        
        if(e.target.classList.contains('delete') || e.target.closest('.delete')){ 
            if(confirm(getTranslation('confirm_delete'))){ 
                orderItems.splice(index,1); 
                renderTable(); 
                utils.showNotification('Order item deleted successfully');
            } 
        }
        
        if(e.target.classList.contains('edit') || e.target.closest('.edit')){
            editingIndex = index;
            const item = orderItems[index];
            orderItemModal.style.display = 'flex';
            modalTitle.textContent = getTranslation('edit');
            orderProductSelect.value = item.product;
            orderProductQuantity.value = item.quantity;
            populateProducts();
        }
    });
    
    // Generate invoice
    generateInvoiceBtn.addEventListener('click', () => {
        if(!selectCustomer.value) {
            utils.showNotification('Please select a customer', 'error');
            return;
        }
        
        if(orderItems.length === 0) {
            utils.showNotification('Please add at least one product to the order', 'error');
            return;
        }
        
        const order = {
            customer: selectCustomer.value,
            date: new Date().toLocaleString(),
            items: orderItems,
            total: parseFloat(orderTotalSpan.textContent)
        };
        
        // Save order
        orders.push(order);
        utils.saveToLocalStorage('orders', orders);
        
        // Update product quantities
        const products = utils.loadFromLocalStorage('products');
        orderItems.forEach(item => {
            const productIndex = products.findIndex(p => p.name === item.product);
            if (productIndex !== -1) {
                products[productIndex].quantity = parseInt(products[productIndex].quantity) - item.quantity;
            }
        });
        utils.saveToLocalStorage('products', products);
        
        utils.showNotification(`Invoice generated for ${order.customer}\nTotal: $${order.total}`);
        
        // Reset order
        orderItems = [];
        selectCustomer.value = '';
        renderTable();
    });
    
    // Export JSON
    exportJSONBtn.addEventListener('click', () => {
        if(orderItems.length === 0) {
            utils.showNotification('No items to export', 'error');
            return;
        }
        
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(orderItems, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', 'order.json');
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        utils.showNotification('Order exported successfully');
    });
    
    populateCustomers();
    renderTable();
    window.orders = orders;
}