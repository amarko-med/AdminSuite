// Products Module
function initProductsModule() {
    const products = utils.loadFromLocalStorage('products');
    const productsTable = document.getElementById('productsTable').querySelector('tbody');
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const closeModal = productModal.querySelector('.close');
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('productModalTitle');
    const searchName = document.getElementById('searchName');
    const filterType = document.getElementById('filterType');
    
    let editingIndex = null;
    
    // Open modal
    addProductBtn.addEventListener('click', () => {
        editingIndex = null;
        modalTitle.textContent = getTranslation('add_product');
        productForm.reset();
        productModal.style.display = 'flex';
    });
    
    // Close modal
    closeModal.addEventListener('click', () => productModal.style.display = 'none');
    window.addEventListener('click', e => { 
        if(e.target === productModal) productModal.style.display = 'none'; 
    });
    
    // Save product
    productForm.addEventListener('submit', e => {
        e.preventDefault();
        const product = {
            name: document.getElementById('productName').value,
            type: document.getElementById('productType').value,
            price: parseFloat(document.getElementById('productPrice').value).toFixed(2),
            quantity: parseInt(document.getElementById('productQuantity').value)
        };
        
        // Validate form data
        const rules = {
            name: { required: true, minLength: 2 },
            price: { required: true, pattern: /^\d+(\.\d{1,2})?$/ },
            quantity: { required: true, pattern: /^\d+$/ }
        };
        
        const errors = utils.validateForm(product, rules);
        
        if (Object.keys(errors).length > 0) {
            utils.showNotification('Please fix validation errors: ' + Object.values(errors).join(', '), 'error');
            return;
        }
        
        if(editingIndex !== null) {
            products[editingIndex] = product;
            utils.showNotification('Product updated successfully');
        } else {
            products.push(product);
            utils.showNotification('Product added successfully');
        }
        
        // Save to localStorage
        utils.saveToLocalStorage('products', products);
        
        renderTable();
        productModal.style.display = 'none';
        updateReportsDashboard(); // Update reports when products change
    });
    
    // Render table
    function renderTable() {
        const nameFilter = searchName.value.toLowerCase();
        const typeFilter = filterType.value;
        productsTable.innerHTML = '';
        
        products
            .filter(p => 
                p.name.toLowerCase().includes(nameFilter) && 
                (typeFilter === '' || p.type === typeFilter)
            )
            .forEach((p, index) => {
                const row = productsTable.insertRow();
                row.dataset.index = index;
                let stockClass = p.quantity < 5 ? 'badge-red' : p.quantity <= 10 ? 'badge-orange' : 'badge-green';
                let imageUrl = getProductImage(p.type, p.name);
                row.innerHTML = `
                    <td><img src="${imageUrl}" alt="${p.name}" class="product-image"></td>
                    <td>${p.name}</td>
                    <td>${p.type}</td>
                    <td>$${p.price}</td>
                    <td class="${stockClass}">${p.quantity}</td>
                    <td class="actions">
                        <button class="edit"><i class="fas fa-edit"></i> ${getTranslation('edit')}</button>
                        <button class="delete"><i class="fas fa-trash"></i> ${getTranslation('delete')}</button>
                    </td>
                `;
            });
    }

    function getProductImage(type, name) {
        const images = {
            'Electronics': 'https://img.icons8.com/ios-filled/100/electronics.png', 
            'Clothing': 'https://img.icons8.com/ios-filled/100/t-shirt.png', 
            'Food': 'https://img.icons8.com/ios-filled/100/meal.png'
        };
        return images[type] || `https://via.placeholder.com/60x60/3498db/ffffff?text=${encodeURIComponent(name.charAt(0))}`;
    }
    
    // Edit/Delete
    productsTable.addEventListener('click', e => {
        const row = e.target.closest('tr'); 
        if(!row) return;
        
        const index = parseInt(row.dataset.index);
        
        if(e.target.classList.contains('delete') || e.target.closest('.delete')){ 
            if(confirm(getTranslation('confirm_delete'))){ 
                products.splice(index,1); 
                utils.saveToLocalStorage('products', products);
                renderTable(); 
                utils.showNotification('Product deleted successfully');
                updateReportsDashboard(); 
            } 
        }
        
        if(e.target.classList.contains('edit') || e.target.closest('.edit')){
            editingIndex = index;
            const p = products[index];
            modalTitle.textContent = getTranslation('edit');
            document.getElementById('productName').value = p.name;
            document.getElementById('productType').value = p.type;
            document.getElementById('productPrice').value = p.price;
            document.getElementById('productQuantity').value = p.quantity;
            productModal.style.display = 'flex';
        }
    });
    
    // Filters with debounce
    searchName.addEventListener('input', utils.debounce(renderTable, 300));
    filterType.addEventListener('change', utils.debounce(renderTable, 300));
    
    renderTable();
    window.products = products;
}