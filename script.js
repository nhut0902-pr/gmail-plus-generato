let deferredPrompt;
let chatHistory = JSON.parse(localStorage.getItem("aiChatHistory")) || [];
let currentLang = localStorage.getItem("lang") || "vi";
let searchIndex = new FlexSearch({ encode: "advanced", tokenize: "forward", async: true });
let searchableContent = [];

// Đa ngôn ngữ
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
  document.getElementById("toggleChat").textContent = t("toggleChat");
  document.querySelector(".chat-header h4").textContent = t("chatTitle");
  document.getElementById("userQuery").placeholder = t("placeholder");
  document.querySelector(".chat-input button").textContent = t("send");
  document.getElementById("installButton").textContent = t("installBtn");
  document.getElementById("switchLangBtn").textContent = t("switchLang");

  const help = document.querySelector(".help-section h3");
  if (help) help.innerHTML = t("helpTitle");
}

// Toast
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show";
  setTimeout(() => toast.className = "toast", duration);
}

// Chat AI
function toggleChat(show) {
  document.getElementById("chatBox").style.display = show ? "block" : "none";
}

document.getElementById("toggleChat").addEventListener("click", () => {
  toggleChat(document.getElementById("chatBox").style.display !== "block");
});

async function sendToAI() {
  const input = document.getElementById("userQuery");
  const messages = document.getElementById("chatMessages");
  const query = input.value.trim();
  if (!query) return;

  chatHistory.push({ role: "user", content: query });
  saveChatHistory();

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
    const botText = data.text;

    chatHistory.push({ role: "bot", content: botText });
    saveChatHistory();

    const botMsg = document.createElement("div");
    botMsg.className = "msg bot";
    botMsg.textContent = botText;
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
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

function saveChatHistory() {
  localStorage.setItem("aiChatHistory", JSON.stringify(chatHistory.slice(-50)));
}

// Tìm kiếm
async function searchContent() {
  const query = document.getElementById("siteSearch").value.trim();
  const resultsContainer = document.getElementById("searchResults");

  if (!query) {
    resultsContainer.classList.remove("show");
    return;
  }

  const results = await searchIndex.search(query);
  if (results.length === 0) {
    resultsContainer.innerHTML = '<div class="no-result">Không tìm thấy</div>';
    resultsContainer.classList.add("show");
    return;
  }

  let html = '';
  results.slice(0, 10).forEach(id => {
    const item = searchableContent.find(c => c.id === id);
    if (item) {
      html += `<div class="search-item" onclick="useSearchResult('${item.ref}')">
                 <strong>${item.type}</strong>: ${item.ref}
               </div>`;
    }
  });

  resultsContainer.innerHTML = html;
  resultsContainer.classList.add("show");
}

function useSearchResult(text) {
  document.getElementById("prefix").value = text.replace(/[^\w]/g, '').toLowerCase();
  document.getElementById("searchResults").classList.remove("show");
}

// Gợi ý thông minh
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
    if (suggestion) {
      document.getElementById("prefix").value = suggestion;
      showToast(`💡 Gợi ý: "${suggestion}" (${context})`);
    }
  } catch (err) {
    const fallback = ["temp", "test", "signup", "shop"][Math.floor(Math.random() * 4)];
    document.getElementById("prefix").value = fallback;
    showToast(`💡 (Dự phòng) Gợi ý: ${fallback}`);
  }
}

// Khởi tạo
window.onload = function () {
  document.getElementById("baseEmail").value = localStorage.getItem("baseEmail") || "";
  document.getElementById("prefix").value = localStorage.getItem("prefix") || "temp";
  document.getElementById("count").value = localStorage.getItem("count") || "5";

  updateUIWithLang();
  loadChatHistory();
  initSearchIndex();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(err => console.log("SW failed:", err));
  }
};

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("installButton").style.display = "block";
});

document.getElementById("installButton").addEventListener("click", () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      document.getElementById("installButton").style.display = "none";
    });
  }
});

// Các hàm còn lại: generateEmails, copyToClipboard, v.v. (giữ nguyên như trước)
// (Đã giới hạn độ dài, nhưng bạn có thể thêm vào nếu cần)
