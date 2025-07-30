// === BIẾN TOÀN CỤC ===
let deferredPrompt;
let chatHistory = [];
let currentLang = "vi";
let searchIndex = null;
let searchableContent = [];

// === ĐA NGÔN NGỮ ===
const LANG = {
  vi: {
    toggleChat: "🤖 Hỏi AI",
    chatTitle: "Trợ lý AI",
    placeholder: "Hỏi tôi về email...",
    send: "Gửi",
    toastNoCopy: "Không có email để sao chép",
    toastCopied: "Đã sao chép!",
    toastError: "Sao chép thất bại",
    toastAiError: "Lỗi kết nối AI",
    generated: "Đã tạo %d email!",
    installBtn: "📲 Cài đặt Ứng dụng",
    helpTitle: "💡 Nó hoạt động thế nào?",
    helpText1: "Gmail cho phép bạn thêm <strong>+từ-khóa</strong> vào email.",
    helpText2: "Ví dụ: <strong>nhut0902+shop1@gmail.com</strong> vẫn nhận thư về <strong>nhut0902@gmail.com</strong>.",
    helpText3: "Dùng để phân biệt nguồn đăng ký, chống spam.",
    switchLang: "🌐 English"
  },
  en: {
    toggleChat: "🤖 Ask AI",
    chatTitle: "AI Assistant",
    placeholder: "Ask me about emails...",
    send: "Send",
    toastNoCopy: "No emails to copy",
    toastCopied: "Copied!",
    toastError: "Copy failed",
    toastAiError: "AI connection error",
    generated: "Generated %d emails!",
    installBtn: "📲 Install App",
    helpTitle: "💡 How it works?",
    helpText1: "Gmail allows <strong>+keyword</strong> in email address.",
    helpText2: "Example: <strong>user+test1@gmail.com</strong> delivers to <strong>user@gmail.com</strong>.",
    helpText3: "Use for signup tracking, spam protection.",
    switchLang: "🌐 Tiếng Việt"
  }
};

function t(key) {
  return LANG[currentLang][key] || key;
}

function switchLang() {
  currentLang = currentLang === "vi" ? "en" : "vi";
  localStorage.setItem("lang", currentLang);
  updateUIWithLang();
}

function updateUIWithLang() {
  const toggleChat = document.getElementById("toggleChat");
  const chatTitle = document.querySelector(".chat-header h4");
  const userQuery = document.getElementById("userQuery");
  const sendBtn = document.querySelector(".chat-input button");
  const installBtn = document.getElementById("installButton");
  const switchBtn = document.getElementById("switchLangBtn");

  if (toggleChat) toggleChat.textContent = t("toggleChat");
  if (chatTitle) chatTitle.textContent = t("chatTitle");
  if (userQuery) userQuery.placeholder = t("placeholder");
  if (sendBtn) sendBtn.textContent = t("send");
  if (installBtn) installBtn.textContent = t("installBtn");
  if (switchBtn) switchBtn.textContent = t("switchLang");
}

// === TOAST ===
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "toast show";
  setTimeout(() => {
    toast.className = "toast";
  }, duration);
}

// === CHAT AI ===
function toggleChat(show) {
  const chatBox = document.getElementById("chatBox");
  if (chatBox) chatBox.style.display = show ? "block" : "none";
}

async function sendToAI() {
  const input = document.getElementById("userQuery");
  const messages = document.getElementById("chatMessages");
  const query = input?.value.trim();
  if (!query || !messages) return;

  // Thêm tin người dùng
  const userMsg = document.createElement("div");
  userMsg.className = "msg user";
  userMsg.textContent = query;
  messages.appendChild(userMsg);

  input.value = "";
  messages.scrollTop = messages.scrollHeight;

  try {
    const response = await fetch("/.netlify/functions/ai-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: query })
    });

    const data = await response.json();
    const botText = data.text || "Tôi không thể trả lời ngay lúc này.";

    const botMsg = document.createElement("div");
    botMsg.className = "msg bot";
    botMsg.textContent = botText;
    messages.appendChild(botMsg);

    messages.scrollTop = messages.scrollHeight;

    // Lưu vào lịch sử
    chatHistory.push({ role: "user", content: query });
    chatHistory.push({ role: "bot", content: botText });
    localStorage.setItem("aiChatHistory", JSON.stringify(chatHistory.slice(-50)));
  } catch (err) {
    const errorMsg = document.createElement("div");
    errorMsg.className = "msg bot";
    errorMsg.style.backgroundColor = "#e74c3c";
    errorMsg.style.color = "white";
    errorMsg.textContent = t("toastAiError");
    messages.appendChild(errorMsg);
    showToast(t("toastAiError"));
  }
}

// === TÌM KIẾM ===
function initSearchIndex() {
  if (!window.FlexSearch) {
    console.warn("FlexSearch không khả dụng");
    return;
  }

  searchIndex = new FlexSearch({
    encode: "advanced",
    tokenize: "forward",
    async: true
  });

  // Dữ liệu mẫu
  const items = [
    { id: 1, type: "Hướng dẫn", content: "Gmail cho phép dùng +từkhóa để tạo email ảo", ref: "Hướng dẫn cách dùng" },
    { id: 2, type: "Tiền tố", content: "test shop news signup", ref: "test" },
    { id: 3, type: "Tiền tố", content: "dangky reg register", ref: "dangky" }
  ];

  items.forEach(item => {
    searchIndex.add(item.id, item.content);
    searchableContent.push(item);
  });
}

async function searchContent() {
  const input = document.getElementById("siteSearch");
  const resultsContainer = document.getElementById("searchResults");
  const query = input?.value.trim();

  if (!query || !resultsContainer || !searchIndex) {
    resultsContainer?.classList.remove("show");
    return;
  }

  try {
    const results = await searchIndex.search(query);
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="no-result">Không tìm thấy</div>';
    } else {
      let html = '';
      results.slice(0, 10).forEach(id => {
        const item = searchableContent.find(c => c.id == id);
        if (item) {
          html += `<div class="search-item" onclick="useSearchResult('${item.ref}')">
                     <strong>${item.type}</strong>: ${item.ref}
                   </div>`;
        }
      });
      resultsContainer.innerHTML = html;
    }
    resultsContainer.classList.add("show");
  } catch (err) {
    resultsContainer.classList.remove("show");
  }
}

function useSearchResult(text) {
  const prefixInput = document.getElementById("prefix");
  if (prefixInput) prefixInput.value = text.replace(/[^\w]/g, '').toLowerCase();
  document.getElementById("searchResults")?.classList.remove("show");
}

document.getElementById("siteSearch")?.addEventListener("input", searchContent);

// === GỢI Ý TIỀN TỐ ===
async function suggestSmartPrefix() {
  const contextOptions = ["đăng ký tài khoản", "test phần mềm", "nhận bản tin", "mua sắm online"];
  const context = contextOptions[Math.floor(Math.random() * contextOptions.length)];
  const prompt = `Gợi ý 1 tiền tố email ngắn cho: "${context}". Chỉ trả về 1 từ.`;

  try {
    const response = await fetch("/.netlify/functions/ai-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    const suggestion = data.text.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (suggestion && suggestion.length <= 20) {
      document.getElementById("prefix").value = suggestion;
      showToast(`💡 Gợi ý: "${suggestion}" (${context})`, 3000);
    } else {
      fallbackSuggestion();
    }
  } catch (err) {
    fallbackSuggestion();
  }
}

function fallbackSuggestion() {
  const suggestions = ["temp", "test", "signup", "shop", "news"];
  const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  document.getElementById("prefix").value = suggestion;
  showToast(`💡 (Dự phòng) Gợi ý: ${suggestion}`, 2500);
}

// === TẠO EMAIL ===
function generateEmails() {
  const baseEmail = document.getElementById("baseEmail")?.value.trim();
  const prefix = (document.getElementById("prefix")?.value.trim() || "temp").replace(/\s+/g, '');
  const countInput = document.getElementById("count")?.value;
  const count = parseInt(countInput, 10);

  const emailList = document.getElementById("emailList");
  const qrList = document.getElementById("qrList");

  if (!emailList || !qrList) return;

  emailList.textContent = "";
  qrList.innerHTML = "";

  if (!baseEmail) {
    alert("Vui lòng nhập email gốc.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(baseEmail)) {
    alert("Email không hợp lệ.");
    return;
  }

  if (!prefix) {
    alert("Tiền tố không được để trống.");
    return;
  }

  if (isNaN(count) || count < 1 || count > 100) {
    alert("Số lượng phải từ 1 đến 100.");
    return;
  }

  const [username, domain] = baseEmail.split("@");
  const emails = [];
  for (let i = 1; i <= count; i++) {
    emails.push(`${username}+${prefix}${i}@${domain}`);
  }

  emailList.textContent = emails.join("\n");
  qrList.innerHTML = `<h3>${currentLang === 'vi' ? 'Mã QR' : 'QR Codes'}</h3>`;
  emails.forEach(email => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=mailto:${email}`;
    const item = document.createElement("div");
    item.className = "email-item";
    item.innerHTML = `
      <div class="email">${email}</div>
      <div class="qr-container">
        <img src="${qrUrl}" alt="QR" />
      </div>
    `;
    qrList.appendChild(item);
  });

  localStorage.setItem("baseEmail", baseEmail);
  localStorage.setItem("prefix", prefix);
  localStorage.setItem("count", count);

  showToast(t("generated").replace("%d", count), 2000);
}

// === SAO CHÉP ===
function copyToClipboard() {
  const emailList = document.getElementById("emailList");
  const text = emailList?.textContent || "";
  if (!text || text === "Kết quả sẽ hiển thị ở đây...") {
    showToast(t("toastNoCopy"));
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    showToast(t("toastCopied"));
  }).catch(() => {
    showToast(t("toastError"));
  });
}

// === KHỞI TẠO ===
window.onload = function () {
  try {
    // Khôi phục dữ liệu
    chatHistory = JSON.parse(localStorage.getItem("aiChatHistory")) || [];
    currentLang = localStorage.getItem("lang") || "vi";

    // Khởi tạo tìm kiếm
    if (typeof FlexSearch !== 'undefined') {
      initSearchIndex();
    }

    // Cập nhật giao diện
    updateUIWithLang();
    loadChatHistory();

    // Gán sự kiện
    document.getElementById("baseEmail").value = localStorage.getItem("baseEmail") || "";
    document.getElementById("prefix").value = localStorage.getItem("prefix") || "temp";
    document.getElementById("count").value = localStorage.getItem("count") || "5";

    // Gắn nút
    document.getElementById("generateBtn")?.addEventListener("click", generateEmails);
    document.getElementById("copyBtn")?.addEventListener("click", copyToClipboard);
    document.getElementById("toggleChat")?.addEventListener("click", () => {
      toggleChat(true);
    });

    // PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(err => {
        console.log("SW lỗi:", err);
      });
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      document.getElementById("installButton").style.display = "block";
    });

  } catch (err) {
    console.error("Lỗi khởi tạo:", err);
    alert("Có lỗi khi tải ứng dụng. Vui lòng làm mới trang.");
  }
};

function loadChatHistory() {
  const messages = document.getElementById("chatMessages");
  if (!messages) return;
  messages.innerHTML = "";

  if (chatHistory.length === 0) {
    const welcome = document.createElement("div");
    welcome.className = "msg bot";
    welcome.textContent = currentLang === "vi"
      ? "Xin chào! Tôi có thể giúp gì cho bạn?"
      : "Hello! How can I help you?";
    messages.appendChild(welcome);
  } else {
    chatHistory.slice(-10).forEach(msg => {
      const el = document.createElement("div");
      el.className = `msg ${msg.role}`;
      el.textContent = msg.content;
      messages.appendChild(el);
    });
  }
      }
