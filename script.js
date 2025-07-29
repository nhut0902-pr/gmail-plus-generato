document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selection ---
    const form = document.getElementById('emailGeneratorForm');
    const originalEmailInput = document.getElementById('originalEmail');
    const quantityInput = document.getElementById('quantity');
    const prefixInput = document.getElementById('prefix');
    const livePreviewSpan = document.getElementById('livePreview');
    
    // Results
    const resultsSection = document.getElementById('resultsSection');
    const resultArea = document.getElementById('resultArea');
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

    // Modals
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpModal = document.getElementById('closeHelpModal');
    const qrModal = document.getElementById('qrModal');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrEmailValue = document.getElementById('qrEmailValue');
    const closeQrModal = document.getElementById('closeQrModal');

    // --- Utility Functions ---
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const generateRandomString = (length = 5) => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // --- FEATURE: USER SETTINGS PERSISTENCE ---
    const saveSettings = () => {
        const settings = {
            email: originalEmailInput.value,
            quantity: quantityInput.value,
            prefix: prefixInput.value,
            separator: document.querySelector('input[name="separator"]:checked').value,
            random: document.getElementById('randomSuffix').checked,
            includeOriginal: document.getElementById('includeOriginal').checked,
        };
        localStorage.setItem('emailGeneratorSettings', JSON.stringify(settings));
    };

    const loadSettings = () => {
        const settings = JSON.parse(localStorage.getItem('emailGeneratorSettings'));
        if (settings) {
            originalEmailInput.value = settings.email || '';
            quantityInput.value = settings.quantity || 10;
            prefixInput.value = settings.prefix || '';
            document.querySelector(`input[name="separator"][value="${settings.separator || '+'}"]`).checked = true;
            document.getElementById('randomSuffix').checked = settings.random || false;
            document.getElementById('includeOriginal').checked = settings.includeOriginal || false;
        }
    };

    // --- FEATURE: SMARTER FORM VALIDATION ---
    const showError = (inputId, message) => {
        const input = document.getElementById(inputId);
        const errorField = document.getElementById(`${inputId}Error`);
        if(input && errorField) {
            input.classList.add('has-error');
            errorField.textContent = message;
        }
    };

    const clearErrors = () => {
        document.querySelectorAll('.error-message').forEach(msg => msg.textContent = '');
        document.querySelectorAll('.has-error').forEach(input => input.classList.remove('has-error'));
    };

    const validateForm = () => {
        clearErrors();
        let isValid = true;
        if (!originalEmailInput.value.trim()) {
            showError('originalEmail', 'Vui lòng nhập địa chỉ email.');
            isValid = false;
        } else if (!originalEmailInput.value.includes('@gmail.com')) {
            showError('originalEmail', 'Hiện chỉ hỗ trợ địa chỉ @gmail.com.');
            isValid = false;
        }
        if (!quantityInput.value) {
            showError('quantity', 'Vui lòng nhập số lượng.');
            isValid = false;
        } else if (parseInt(quantityInput.value) < 1) {
            showError('quantity', 'Số lượng phải lớn hơn 0.');
            isValid = false;
        }
        return isValid;
    };
    
    // --- Main Logic ---
    const displayResults = (emails) => {
        resultArea.innerHTML = '';
        if (emails.length === 0) return;

        emails.forEach(email => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML = `
                <span class="result-email">${email}</span>
                <div class="result-actions">
                    <button class="copy-single-btn" title="Sao chép email này"><i class="fas fa-copy"></i></button>
                    <button class="qr-single-btn" title="Hiển thị mã QR"><i class="fas fa-qrcode"></i></button>
                </div>`;
            resultArea.appendChild(item);
        });
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showToast('Vui lòng kiểm tra lại các lỗi.', 'error');
            return;
        }
        saveSettings();
        
        const originalEmail = originalEmailInput.value.trim();
        const quantity = parseInt(quantityInput.value, 10);
        const prefix = prefixInput.value.trim();
        const separator = document.querySelector('input[name="separator"]:checked').value;
        const useRandom = document.getElementById('randomSuffix').checked;
        const includeOriginal = document.getElementById('includeOriginal').checked;

        const [username] = originalEmail.split('@');
        const cleanUsername = username.split('+')[0];
        const generatedEmails = [];
        
        for (let i = 1; i <= quantity; i++) {
            let alias = useRandom ? (prefix ? `${prefix}_${generateRandomString()}` : generateRandomString()) : (prefix ? `${prefix}${i}` : `${i}`);
            generatedEmails.push(`${cleanUsername}${separator}${alias}@gmail.com`);
        }
        
        if (includeOriginal) generatedEmails.unshift(originalEmail);
        
        displayResults(generatedEmails);
        resultCount.textContent = generatedEmails.length;
        resultsSection.style.display = 'block';
        showToast(`Đã tạo thành công ${generatedEmails.length} email!`);
    };
    
    const getAllEmailsFromResults = () => {
        return Array.from(resultArea.querySelectorAll('.result-email')).map(el => el.textContent).join('\n');
    };

    const handleCopyAll = () => {
        const allEmailsText = getAllEmailsFromResults();
        if (!allEmailsText) {
            showToast('Không có gì để sao chép!', 'error');
            return;
        }
        navigator.clipboard.writeText(allEmailsText).then(() => showToast('Đã sao chép tất cả email!'));
    };
    
    const handleExport = () => {
        const allEmailsText = getAllEmailsFromResults();
        if (!allEmailsText) {
            showToast('Không có gì để xuất!', 'error'); return;
        }
        const blob = new Blob([allEmailsText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `danh-sach-email.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        form.reset();
        clearErrors();
        resultsSection.style.display = 'none';
        resultArea.innerHTML = '';
        resultCount.textContent = '0';
        localStorage.removeItem('emailGeneratorSettings');
        showToast('Đã xóa và đặt lại.');
    };

    // --- FEATURE: HELP & QR MODAL ---
    const setupModals = () => {
        helpBtn.onclick = () => helpModal.style.display = 'block';
        closeHelpModal.onclick = () => helpModal.style.display = 'none';
        closeQrModal.onclick = () => qrModal.style.display = 'none';
        window.onclick = (event) => {
            if (event.target == helpModal) helpModal.style.display = 'none';
            if (event.target == qrModal) qrModal.style.display = 'none';
        };
    };

    let qrcode = null;
    const showQrCode = (email) => {
        qrCodeContainer.innerHTML = '';
        if (typeof QRCode === 'undefined') {
            showToast('Lỗi: Thư viện QRCode chưa được tải.', 'error');
            return;
        }
        qrcode = new QRCode(qrCodeContainer, {
            text: email,
            width: 200,
            height: 200,
            correctLevel: QRCode.CorrectLevel.H
        });
        qrEmailValue.textContent = email;
        qrModal.style.display = 'block';
    };

    // --- FEATURE: PWA ---
    const registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('Service Worker: Registered', reg))
                    .catch(err => console.log('Service Worker: Error', err));
            });
        }
    };
    
    // --- Theme ---
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        themeToggle.checked = theme === 'dark';
    };
    const handleThemeToggle = () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    // --- Event Listeners ---
    form.addEventListener('submit', handleGenerate);
    copyAllBtn.addEventListener('click', handleCopyAll);
    exportBtn.addEventListener('click', handleExport);
    clearBtn.addEventListener('click', handleClear);
    themeToggle.addEventListener('change', handleThemeToggle);
    resultArea.addEventListener('click', (e) => {
        const copyButton = e.target.closest('.copy-single-btn');
        const qrButton = e.target.closest('.qr-single-btn');
        if (copyButton) {
            const email = copyButton.closest('.result-item').querySelector('.result-email').textContent;
            navigator.clipboard.writeText(email).then(() => showToast(`Đã sao chép: ${email}`));
        }
        if (qrButton) {
            const email = qrButton.closest('.result-item').querySelector('.result-email').textContent;
            showQrCode(email);
        }
    });

    // --- Initializations ---
    loadSettings();
    setupModals();
    registerServiceWorker();
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
});
