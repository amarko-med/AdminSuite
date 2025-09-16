// Employees Module
function initEmployeesModule() {
    const employees = utils.loadFromLocalStorage('employees');
    const employeesTable = document.getElementById('employeesTable').querySelector('tbody');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const employeeModal = document.getElementById('employeeModal');
    const closeModal = employeeModal.querySelector('.close');
    const employeeForm = document.getElementById('employeeForm');
    const modalTitle = document.getElementById('employeeModalTitle');
    const searchEmployee = document.getElementById('searchEmployee');
    const filterRole = document.getElementById('filterRole');
    const filterDepartment = document.getElementById('filterDepartment');
    
    let editingIndex = null;
    
    // Open modal
    addEmployeeBtn.addEventListener('click', () => {
        editingIndex = null;
        modalTitle.textContent = getTranslation('add_employee');
        employeeForm.reset();
        employeeModal.style.display = 'flex';
    });
    
    // Close modal
    closeModal.addEventListener('click', () => employeeModal.style.display = 'none');
    window.addEventListener('click', e => { 
        if(e.target === employeeModal) employeeModal.style.display = 'none'; 
    });
    
    // Save employee
    employeeForm.addEventListener('submit', e => {
        e.preventDefault();
        const employee = {
            name: document.getElementById('employeeName').value,
            role: document.getElementById('employeeRole').value,
            department: document.getElementById('employeeDepartment').value,
            tasks: document.getElementById('employeeTasks').value
        };
        
        // Validate form data
        const rules = {
            name: { required: true, minLength: 2 }
        };
        
        const errors = utils.validateForm(employee, rules);
        
        if (Object.keys(errors).length > 0) {
            utils.showNotification('Please fix validation errors: ' + Object.values(errors).join(', '), 'error');
            return;
        }
        
        if(editingIndex !== null) {
            employees[editingIndex] = employee;
            utils.showNotification('Employee updated successfully');
        } else {
            employees.push(employee);
            utils.showNotification('Employee added successfully');
        }
        
        // Save to localStorage
        utils.saveToLocalStorage('employees', employees);
        
        renderTable();
        employeeModal.style.display = 'none';
    });
    
    // Render table
    function renderTable() {
        const nameFilter = searchEmployee.value.toLowerCase();
        const roleFilter = filterRole.value;
        const deptFilter = filterDepartment.value;
        employeesTable.innerHTML = '';
        
        employees
            .filter(emp => 
                emp.name.toLowerCase().includes(nameFilter) && 
                (roleFilter === '' || emp.role === roleFilter) &&
                (deptFilter === '' || emp.department === deptFilter)
            )
            .forEach((emp, index) => {
                const row = employeesTable.insertRow();
                row.dataset.index = index;
                row.innerHTML = `
                    <td>${emp.name}</td>
                    <td>${emp.role}</td>
                    <td>${emp.department}</td>
                    <td>${emp.tasks}</td>
                    <td class="actions">
                        <button class="edit"><i class="fas fa-edit"></i> ${getTranslation('edit')}</button>
                        <button class="delete"><i class="fas fa-trash"></i> ${getTranslation('delete')}</button>
                    </td>
                `;
            });
    }
    
    // Edit/Delete
    employeesTable.addEventListener('click', e => {
        const row = e.target.closest('tr'); 
        if(!row) return;
        
        const index = parseInt(row.dataset.index);
        
        if(e.target.classList.contains('delete') || e.target.closest('.delete')){ 
            if(confirm(getTranslation('confirm_delete'))){ 
                employees.splice(index,1); 
                utils.saveToLocalStorage('employees', employees);
                renderTable(); 
                utils.showNotification('Employee deleted successfully');
            } 
        }
        
        if(e.target.classList.contains('edit') || e.target.closest('.edit')){
            editingIndex = index;
            const emp = employees[index];
            modalTitle.textContent = getTranslation('edit');
            document.getElementById('employeeName').value = emp.name;
            document.getElementById('employeeRole').value = emp.role;
            document.getElementById('employeeDepartment').value = emp.department;
            document.getElementById('employeeTasks').value = emp.tasks;
            employeeModal.style.display = 'flex';
        }
    });
    
    // Filters with debounce
    searchEmployee.addEventListener('input', utils.debounce(renderTable, 300));
    filterRole.addEventListener('change', utils.debounce(renderTable, 300));
    filterDepartment.addEventListener('change', utils.debounce(renderTable, 300));
    
    renderTable();
    window.employees = employees;
}