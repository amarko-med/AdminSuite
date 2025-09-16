// Customers Module
function initCustomersModule() {
    const customers = utils.loadFromLocalStorage('customers');
    const customersTable = document.getElementById('customersTable').querySelector('tbody');
    const addCustomerBtn = document.getElementById('addCustomerBtn');
    const customerModal = document.getElementById('customerModal');
    const closeModal = customerModal.querySelector('.close');
    const customerForm = document.getElementById('customerForm');
    const modalTitle = document.getElementById('customerModalTitle');
    const searchCustomer = document.getElementById('searchCustomer');
    const filterTags = document.getElementById('filterTags');
    
    let editingIndex = null;
    
    // Open modal
    addCustomerBtn.addEventListener('click', () => {
        editingIndex = null;
        modalTitle.textContent = getTranslation('add_customer');
        customerForm.reset();
        customerModal.style.display = 'flex';
    });
    
    // Close modal
    closeModal.addEventListener('click', () => customerModal.style.display = 'none');
    window.addEventListener('click', e => { 
        if(e.target === customerModal) customerModal.style.display = 'none'; 
    });
    
    // Save customer
    customerForm.addEventListener('submit', e => {
        e.preventDefault();
        const customer = {
            name: document.getElementById('customerName').value,
            email: document.getElementById('customerEmail').value,
            tags: document.getElementById('customerTags').value
        };
        
        // Validate form data
        const rules = {
            name: { required: true, minLength: 2 },
            email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
        };
        
        const errors = utils.validateForm(customer, rules);
        
        if (Object.keys(errors).length > 0) {
            utils.showNotification('Please fix validation errors: ' + Object.values(errors).join(', '), 'error');
            return;
        }
        
        if(editingIndex !== null) {
            customers[editingIndex] = customer;
            utils.showNotification('Customer updated successfully');
        } else {
            customers.push(customer);
            utils.showNotification('Customer added successfully');
        }
        
        // Save to localStorage
        utils.saveToLocalStorage('customers', customers);
        
        renderTable();
        customerModal.style.display = 'none';
        updateReportsDashboard(); 
    });
    
    // Render table
    function renderTable() {
        const nameFilter = searchCustomer.value.toLowerCase();
        const tagFilter = filterTags.value.toLowerCase();
        customersTable.innerHTML = '';
        
        customers
            .filter(c => 
                c.name.toLowerCase().includes(nameFilter) && 
                (tagFilter === '' || c.tags.toLowerCase().includes(tagFilter))
            )
            .forEach((c, index) => {
                const row = customersTable.insertRow();
                row.dataset.index = index;
                row.innerHTML = `
                    <td>${c.name}</td>
                    <td>${c.email}</td>
                    <td>${c.tags}</td>
                    <td class="actions">
                        <button class="edit"><i class="fas fa-edit"></i> ${getTranslation('edit')}</button>
                        <button class="delete"><i class="fas fa-trash"></i> ${getTranslation('delete')}</button>
                    </td>
                `;
            });
    }
    
    // Edit/Delete
    customersTable.addEventListener('click', e => {
        const row = e.target.closest('tr'); 
        if(!row) return;
        
        const index = parseInt(row.dataset.index);
        
        if(e.target.classList.contains('delete') || e.target.closest('.delete')){ 
            if(confirm(getTranslation('confirm_delete'))){ 
                customers.splice(index,1); 
                utils.saveToLocalStorage('customers', customers);
                renderTable(); 
                utils.showNotification('Customer deleted successfully');
                updateReportsDashboard();
            } 
        }
        
        if(e.target.classList.contains('edit') || e.target.closest('.edit')){
            editingIndex = index;
            const c = customers[index];
            modalTitle.textContent = getTranslation('edit');
            document.getElementById('customerName').value = c.name;
            document.getElementById('customerEmail').value = c.email;
            document.getElementById('customerTags').value = c.tags;
            customerModal.style.display = 'flex';
        }
    });
    
    // Filters with debounce
    searchCustomer.addEventListener('input', utils.debounce(renderTable, 300));
    filterTags.addEventListener('input', utils.debounce(renderTable, 300));
    
    renderTable();
    window.customers = customers;
}