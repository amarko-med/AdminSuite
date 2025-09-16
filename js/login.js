document.addEventListener('DOMContentLoaded', () => {
    // --- Select Elements ---
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const emailTip = document.getElementById('email-error');
    const passwordTip = document.getElementById('password-error');
    const mainErrorMsg = document.getElementById('error');

    // --- Initial Tip Content ---
    emailTip.textContent = 'Write any email.';
    passwordTip.textContent = 'Write any password.';
    emailTip.style.color = '#b0e0e6';
    passwordTip.style.color = '#b0e0e6';

    // --- Show/Hide Password ---
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.textContent = type === 'password' ? 'Show' : 'Hide';
    });

    // --- Form Submission ---
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        mainErrorMsg.textContent = '';

        if (!emailInput.value || !passwordInput.value) {
            mainErrorMsg.textContent = 'Please enter both an email and password.';
            return;
        }

        // Redirect to dashboard 
        window.location.href = "dashboard.html";
    });

    // --- Live Input Feedback ---
    emailInput.addEventListener('input', () => {
        if (emailInput.value.length === 0) {
            emailTip.textContent = 'Write any email.';
            emailTip.style.color = '#b0e0e6';
        } else if (!emailInput.value.includes('@') || !emailInput.value.includes('.') || emailInput.value.lastIndexOf('.') <= emailInput.value.lastIndexOf('@') || emailInput.value.lastIndexOf('.') === emailInput.value.length - 1) {
            emailTip.textContent = 'A valid email is required.';
            emailTip.style.color = '#ffcccc';
        } else {
            emailTip.textContent = 'Looks good!';
            emailTip.style.color = '#28a745';
        }
    });

    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.length === 0) {
            passwordTip.textContent = 'Write any password.';
            passwordTip.style.color = '#b0e0e6';
        } else if (passwordInput.value.length < 8) {
            passwordTip.textContent = 'Password must be at least 8 characters long.';
            passwordTip.style.color = '#ffcccc';
        } else {
            passwordTip.textContent = 'Looks good!';
            passwordTip.style.color = '#28a745';
        }
    });
});
