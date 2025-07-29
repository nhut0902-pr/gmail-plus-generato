document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selection ---
    const form = document.getElementById('emailGeneratorForm');
    const originalEmailInput = document.getElementById('originalEmail');
    const quantityInput = document.getElementById('quantity');
    const prefixInput = document.getElementById('prefix');
    const livePreviewSpan = document.getElementById('livePreview');
    
    // Results
    const resultsSection = document.getElementById('resultsSection');
    const resultArea = document.getElementById('resultArea'); // This is now a DIV
    const resultCount = document.getElementById('resultCount');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exportBtn = document.getElementById('exportBtn');

    // Toast & Progress
    const toastContainer = document.getElementById('toastContainer');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    
    // Theme
    const themeToggle = document.getElementById('themeToggle');

    // NEW FEATURE: Help Modal
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');

    // NEW FEATURE: QR Code Modal
    const qrModal = document.getElementById('qrModal');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrEmailValue = document.getElementById('qrEmailValue');

    // --- Utility Functions ---
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function generateRandomString(length = 5) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // --- FEATURE 1: USER SETTINGS PERSISTENCE ---
    function saveSettings() {
        const settings = {
            email: originalEmailInput.value,
            quantity: quantityInput.value,
            prefix: prefixInput.value,
            separator: document.querySelector('input[name="separator"]:checked').value,
            random: document.getElementById('randomSuffix').checked,
            includeOriginal: document.getElementById('includeOriginal').checked,
        };
        localStorage.setItem('emailGeneratorSettings', JSON.stringify(settings));
    }

    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('emailGeneratorSettings'));
        if (settings) {
            originalEmailInput.value = settings.email || 'nhut0902@gmail.com';
            quantityInput.value = settings.quantity || 10;
            prefixInput.value = settings.prefix || '';
            document.querySelector(`input[name="separator"][value="${settings.separator || '+'}"]`).checked = true;
            document.getElementById('randomSuffix').checked = settings.random || false;
            document.getElementById('includeOriginal').checked = settings.includeOriginal || false;
        }
    }

    // --- FEATURE 2: SMARTER FORM VALIDATION ---
    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorField = document.getElementById(`${inputId}Error`);
        input.classList.add('has-error');
        errorField.textContent = message;
    }

    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.textContent = '');
        const errorInputs = document.querySelectorAll('.has-error');
        errorInputs.forEach(input => input.classList.remove('has-error'));
    }

    function validateForm() {
        clearErrors();
        let isValid = true;
        const email = originalEmailInput.value.trim();
        const quantity = quantityInput.value;

        if (!email) {
            showError('originalEmail', 'Vui lòng nhập địa chỉ email.');
            isValid = false;
        } else if (!email.includes('@gmail.com')) {
            showError('originalEmail', 'Chỉ hỗ trợ địa chỉ @gmail.com.');
            isValid = false;
        }

        if (!quantity) {
            showError('quantity', 'Vui lòng nhập số lượng.');
            isValid = false;
        } else if (parseInt(quantity) < 1) {
            showError('quantity', 'Số lượng phải lớn hơn 0.');
            isValid = false;
        }
        return isValid;
    }
    
    // --- Live Preview & Main Logic ---
    function updateLivePreview() { /* ... (no changes) ... */ }

    // MODIFIED: Display results in the new DIV structure
    function displayResults(emails) {
        resultArea.innerHTML = ''; // Clear previous results
        if (emails.length === 0) return;

        emails.forEach(email => {
            const item = document.createElement('div');
            item.className = 'result-item';

            const emailSpan = document.createElement('span');
            emailSpan.className = 'result-email';
            emailSpan.textContent = email;

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'result-actions';

            // Copy button for single email
            const copyBtn = document.createElement('button');
            copyBtn.title = 'Sao chép email này';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(email).then(() => showToast(`Đã sao chép: ${email}`));
            };

            // QR Code button for single email
            const qrBtn = document.createElement('button');
            qrBtn.title = 'Hiển thị mã QR';
            qrBtn.innerHTML = '<i class="fas fa-qrcode"></i>';
            qrBtn.onclick = () => showQrCode(email);

            actionsDiv.appendChild(copyBtn);
            actionsDiv.appendChild(qrBtn);
            item.appendChild(emailSpan);
            item.appendChild(actionsDiv);
            resultArea.appendChild(item);
        });
    }

    function handleGenerate(e) {
        e.preventDefault();
        if (!validateForm()) {
            showToast('Vui lòng kiểm tra lại các lỗi.', 'error');
            return;
        }

        saveSettings(); // Save settings on successful generation
        
        // ... (generation logic is the same)
        const originalEmail = originalEmailInput.value.trim();
        const quantity = parseInt(quantityInput.value, 10);
        const prefix = prefixInput.value.trim();
        const separator = document.querySelector('input[name="separator"]:checked').value;
        const useRandom = document.getElementById('randomSuffix').checked;
        const includeOriginal = document.getElementById('includeOriginal').checked;

        const [username, domain] = originalEmail.split('@');
        const cleanUsername = username.split('+')[0];
        const generatedEmails = [];
        progressContainer.style.display = 'block';
        
        for (let i = 1; i <= quantity; i++) {
            let alias = useRandom ? (prefix ? `${prefix}_${generateRandomString()}` : generateRandomString()) : (prefix ? `${prefix}${i}` : `${i}`);
            generatedEmails.push(`${cleanUsername}${separator}${alias}@${domain}`);
            progressBar.style.width = `${(i / quantity) * 100}%`;
        }
        
        if (includeOriginal) {
            generatedEmails.unshift(originalEmail);
        }

        displayResults(generatedEmails); // Use new display function
        resultCount.textContent = generatedEmails.length;
        resultsSection.style.display = 'block';
        showToast(`Đã tạo thành công ${generatedEmails.length} email!`);
        
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
        }, 1000);
    }
    
    function getAllEmailsFromResults() {
        const emailElements = resultArea.querySelectorAll('.result-email');
        return Array.from(emailElements).map(el => el.textContent).join('\n');
    }

    // Modified copy all logic
    function handleCopyAll() {
        const allEmailsText = getAllEmailsFromResults();
        if (!allEmailsText) {
            showToast('Không có gì để sao chép!', 'error');
            return;
        }
        navigator.clipboard.writeText(allEmailsText).then(() => {
            showToast('Đã sao chép tất cả email!');
        });
    }
    
    function handleExport() {
        const allEmailsText = getAllEmailsFromResults();
        if (!allEmailsText) {
            showToast('Không có gì để xuất!', 'error');
            return;
        }
        // ... (export logic is the same)
        const blob = new Blob([allEmailsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email_list_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function handleClear() {
        form.reset();
        clearErrors();
        resultsSection.style.display = 'none';
        resultArea.innerHTML = '';
        resultCount.textContent = '0';
        localStorage.removeItem('emailGeneratorSettings'); // Also clear saved settings
        loadSettings(); // Load defaults
        updateLivePreview();
        showToast('Đã xóa và đặt lại.');
    }

    // --- FEATURE 3: HELP MODAL ---
    function setupModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.close-btn');
            closeBtn.onclick = () => modal.style.display = 'none';
        });

        window.onclick = (event) => {
            modals.forEach(modal => {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            });
        };

        helpBtn.onclick = () => helpModal.style.display = 'block';
    }

    // --- FEATURE 4: QR CODE ---
    let qrcode = null; // To hold the QRCode instance
    function showQrCode(email) {
        qrCodeContainer.innerHTML = ''; // Clear previous QR
        if (!qrcode) {
             qrcode = new QRCode(qrCodeContainer, {
                width: 200,
                height: 200,
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        qrcode.makeCode(email);
        qrEmailValue.textContent = email;
        qrModal.style.display = 'block';
    }

    // --- FEATURE 5: PWA (Service Worker Registration) ---
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }
    }
    
    // --- Event Listeners & Initializations ---
    form.addEventListener('submit', handleGenerate);
    copyAllBtn.addEventListener('click', handleCopyAll);
    exportBtn.addEventListener('click', handleExport);
    clearBtn.addEventListener('click', handleClear);
    themeToggle.addEventListener('change', () => { /* theme logic... */ });
    
    [originalEmailInput, prefixInput, document.getElementById('randomSuffix'), ...document.querySelectorAll('input[name="separator"]')].forEach(el => {
        el.addEventListener('input', updateLivePreview);
        el.addEventListener('change', updateLivePreview);
    });

    // --- Initializations ---
    loadSettings(); // Load user settings
    // loadTheme(); // Assuming you have this function
    updateLivePreview();
    setupModals(); // Set up all modal events
    registerServiceWorker(); // Register the PWA service worker
});
