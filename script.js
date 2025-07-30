let deferredPrompt;
let chatHistory = JSON.parse(localStorage.getItem("aiChatHistory")) || [];
let currentLang = localStorage.getItem("lang") || "vi";

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
    installBtn: "📲 Cài đặt Ứng dụng"
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
    installBtn: "📲 Install App"
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
  document.getElementById("userQuery").placeholder = "Hỏi tôi hoặc gõ: Tìm cách tạo email ảo";
  document.querySelector(".chat-input button").textContent = t("send");
  document.getElementById("installButton").textContent = t("installBtn");
  document.getElementById("switchLangBtn").textContent = currentLang === "vi" ? "🌐 English" : "🌐 Tiếng Việt";
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "toast show";
  setTimeout(() => {
    toast.className = "toast";
  }, duration);
}

function toggleChat(show) {
  const chatBox = document.getElementById("chatBox");
  if (chatBox) chatBox.style.display = show ? "flex" : "none";
}

document.getElementById("toggleChat")?.addEventListener("click", () => {
  toggleChat(true);
});

// Tìm kiếm miễn phí với DuckDuckGo
async function searchWeb(query) {
  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    const data = await response.json();
    const results = [];

    if (data.AbstractText) {
      results.push({
        title: data.Heading || "Thông tin",
        snippet: data.AbstractText,
        link: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
      });
    }

    if (data.RelatedTopics) {
      data.RelatedTopics.slice(0, 5).forEach(topic => {
        if (topic.FirstURL && topic.Text) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text,
            snippet: topic.Text,
            link: topic.FirstURL
          });
        }
      });
    }

    return results.length > 0 ? results : [{
      title: "Không tìm thấy",
      snippet: "Không có kết quả phù hợp.",
      link: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
    }];
  } catch (err) {
    return [{
      title: "Lỗi mạng",
      snippet: "Không thể kết nối tìm kiếm.",
      link: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
    }];
  }
}

function displaySearchResults(results, query) {
  const messages = document.getElementById("chatMessages");
  const resultDiv = document.createElement("div");
  resultDiv.className = "search-result-block";

  let html = `<div class="search-header">🔍 Tìm: <strong>"${query}"</strong></div>`;
  html += `<div class="search-items">`;
  results.forEach(item => {
    html += `
      <div class="search-item">
        <a href="${item.link}" target="_blank" rel="noopener" class="search-title">${item.title}</a>
        <p class="search-snippet">${item.snippet}</p>
      </div>`;
  });
  html += `</div>`;
  resultDiv.innerHTML = html;
  messages.appendChild(resultDiv);
  messages.scrollTop = messages.scrollHeight;
}

async function sendToAI() {
  const input = document.getElementById("userQuery");
  const messages = document.getElementById("chatMessages");
  const query = input?.value.trim();
  if (!query || !messages) return;

  const userMsg = document.createElement("div");
  userMsg.className = "msg user";
  userMsg.textContent = query;
  messages.appendChild(userMsg);

  input.value = "";
  messages.scrollTop = messages.scrollHeight;

  // Kiểm tra lệnh tìm kiếm
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes("tìm") || lowerQuery.includes("search") || lowerQuery.includes("xem")) {
    const results = await searchWeb(query);
    displaySearchResults(results, query);
    chatHistory.push({ role: "user", content: query });
    chatHistory.push({ role: "bot", content: "search_results" });
    localStorage.setItem("aiChatHistory", JSON.stringify(chatHistory.slice(-50)));
    return;
  }

  // Gọi AI
  try {
    const response = await fetch("/.netlify/functions/ai-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: query })
    });

    const data = await response.json();
    const botText = data.text || "Tôi không thể trả lời lúc này.";

    const botMsg = document.createElement("div");
    botMsg.className = "msg bot";
    botMsg.textContent = botText;
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;

    chatHistory.push({ role: "user", content: query });
    chatHistory.push({ role: "bot", content: botText });
    localStorage.setItem("aiChatHistory", JSON.stringify(chatHistory.slice(-50)));
  } catch (err) {
    const errorMsg = document.createElement("div");
    errorMsg.className = "msg bot";
    errorMsg.style.backgroundColor = "#e74c3c";
    errorMsg.style.color = "white";
    errorMsg.textContent = "Không thể kết nối AI.";
    messages.appendChild(errorMsg);
    showToast("Lỗi AI");
  }
}

async function suggestSmartPrefix() {
  const context = ["đăng ký", "test", "mua sắm", "newsletter"][Math.floor(Math.random() * 4)];
  const prompt = `Gợi ý 1 tiền tố email cho: "${context}". Chỉ trả về 1 từ.`;

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
      showToast(`💡 Gợi ý: ${suggestion}`);
    }
  } catch (err) {
    const fallback = ["temp", "test", "shop", "news"][Math.floor(Math.random() * 4)];
    document.getElementById("prefix").value = fallback;
    showToast(`💡 Gợi ý (dự phòng): ${fallback}`);
  }
}

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
  qrList.innerHTML = `<h3>Mã QR</h3>`;
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

function copyToClipboard() {
  const text = document.getElementById("emailList").textContent;
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

window.onload = function () {
  document.getElementById("baseEmail").value = localStorage.getItem("baseEmail") || "";
  document.getElementById("prefix").value = localStorage.getItem("prefix") || "temp";
  document.getElementById("count").value = localStorage.getItem("count") || "5";

  updateUIWithLang();
  loadChatHistory();

  document.getElementById("generateBtn")?.addEventListener("click", generateEmails);
  document.getElementById("copyBtn")?.addEventListener("click", copyToClipboard);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById("installButton").style.display = "block";
  });

  document.getElementById("installButton")?.addEventListener("click", () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        document.getElementById("installButton").style.display = "none";
      });
    }
  });
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
      if (msg.role === "bot" && msg.content === "search_results") return;
      const el = document.createElement("div");
      el.className = `msg ${msg.role}`;
      el.textContent = msg.content;
      messages.appendChild(el);
    });
  }
}
