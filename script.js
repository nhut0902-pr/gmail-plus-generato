document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selection ---
    const form = document.getElementById('emailGeneratorForm');
    const originalEmailInput = document.getElementById('originalEmail');
    const quantityInput = document.getElementById('quantity');
    const prefixInput = document.getElementById('prefix');
    const livePreviewSpan = document.getElementById('livePreview');
    const resultsSection = document.getElementById('resultsSection');
    const resultArea = document.getElementById('resultArea');
    const resultCount = document.getElementById('resultCount');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exportBtn = document.getElementById('exportBtn');
    const toastContainer = document.getElementById('toastContainer');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const themeToggle = document.getElementById('themeToggle');

    // --- Utility Functions ---
    /**
     * Shows a toast notification.
     * @param {string} message The message to display.
     * @param {string} type 'success' or 'error'.
     */
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    /**
     * Generates a random alphanumeric string.
     * @param {number} length The length of the string.
     */
    function generateRandomString(length = 5) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Updates the live preview based on current form inputs.
     */
    function updateLivePreview() {
        const email = originalEmailInput.value.trim();
        const prefix = prefixInput.value.trim();
        const separator = document.querySelector('input[name="separator"]:checked').value;
        const useRandom = document.getElementById('randomSuffix').checked;

        if (!email.includes('@')) {
            livePreviewSpan.textContent = '...';
            return;
        }

        const [username, domain] = email.split('@');
        let suffix = '';

        if (useRandom) {
            suffix = prefix ? `${prefix}_${generateRandomString()}` : generateRandomString();
        } else {
            suffix = prefix ? `${prefix}1` : '1';
        }

        livePreviewSpan.textContent = `${username}${separator}${suffix}@${domain}`;
    }

    /**
     * Handles the generation of emails.
     * @param {Event} e The form submit event.
     */
    function handleGenerate(e) {
        e.preventDefault();

        // Get values
        const originalEmail = originalEmailInput.value.trim();
        const quantity = parseInt(quantityInput.value, 10);
        const prefix = prefixInput.value.trim();
        const separator = document.querySelector('input[name="separator"]:checked').value;
        const useRandom = document.getElementById('randomSuffix').checked;
        const includeOriginal = document.getElementById('includeOriginal').checked;

        // Validation
        if (!originalEmail.includes('@gmail.com')) {
            showToast('Vui lòng nhập một địa chỉ Gmail hợp lệ!', 'error');
            return;
        }
        if (isNaN(quantity) || quantity < 1) {
            showToast('Số lượng phải là một số lớn hơn 0!', 'error');
            return;
        }

        const [username, domain] = originalEmail.split('@');
        // Handle cases like user.name+something@gmail.com -> remove existing +aliases
        const cleanUsername = username.split('+')[0];

        const generatedEmails = [];
        progressContainer.style.display = 'block';
        
        // Generation loop
        for (let i = 1; i <= quantity; i++) {
            let alias;
            if (useRandom) {
                alias = prefix ? `${prefix}_${generateRandomString()}` : generateRandomString();
            } else {
                alias = prefix ? `${prefix}${i}` : `${i}`;
            }

            const newEmail = `${cleanUsername}${separator}${alias}@${domain}`;
            generatedEmails.push(newEmail);
            progressBar.style.width = `${(i / quantity) * 100}%`;
        }
        
        if (includeOriginal) {
            generatedEmails.unshift(originalEmail);
        }

        // Display results
        resultArea.value = generatedEmails.join('\n');
        resultCount.textContent = generatedEmails.length;
        resultsSection.style.display = 'block';
        showToast(`Đã tạo thành công ${generatedEmails.length} email!`);
        
        // Reset progress bar after a short delay
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
        }, 1000);
    }

    /**
     * Handles copying text to the clipboard.
     */
    function handleCopy() {
        if (!resultArea.value) {
            showToast('Không có gì để sao chép!', 'error');
            return;
        }
        navigator.clipboard.writeText(resultArea.value).then(() => {
            showToast('Đã sao chép vào clipboard!');
            copyBtn.textContent = 'Đã sao chép!';
            setTimeout(() => { copyBtn.textContent = 'Sao chép tất cả'; }, 2000);
        }).catch(err => {
            showToast('Sao chép thất bại!', 'error');
            console.error('Copy failed', err);
        });
    }
    
    /**
     * Handles exporting the list to a .txt file.
     */
    function handleExport() {
        if (!resultArea.value) {
            showToast('Không có gì để xuất!', 'error');
            return;
        }
        const blob = new Blob([resultArea.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email_list_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Đã bắt đầu tải xuống file .txt!');
    }

    /**
     * Clears all inputs and results.
     */
    function handleClear() {
        form.reset();
        resultsSection.style.display = 'none';
        resultArea.value = '';
        resultCount.textContent = '0';
        updateLivePreview();
        showToast('Đã xóa và đặt lại.');
    }

    /**
     * Toggles the theme and saves the preference.
     */
    function handleThemeToggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    /**
     * Loads saved theme from localStorage on page load.
     */
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.checked = savedTheme === 'dark';
    }


    // --- Event Listeners ---
    form.addEventListener('submit', handleGenerate);
    copyBtn.addEventListener('click', handleCopy);
    exportBtn.addEventListener('click', handleExport);
    clearBtn.addEventListener('click', handleClear);
    themeToggle.addEventListener('change', handleThemeToggle);

    // Live preview listeners
    [originalEmailInput, prefixInput, document.getElementById('randomSuffix'), ...document.querySelectorAll('input[name="separator"]')].forEach(el => {
        el.addEventListener('input', updateLivePreview);
        el.addEventListener('change', updateLivePreview); // For checkboxes/radios
    });

    // --- Initializations ---
    loadTheme();
    updateLivePreview();
});
