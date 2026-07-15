const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotPanel = document.getElementById("chatbot-panel");
const chatbotClose = document.getElementById("chatbot-close");
const chatbotForm = document.getElementById("chatbot-form");
const chatbotInput = document.getElementById("chatbot-input");
const chatbotMessages = document.getElementById("chatbot-messages");

const conversation = [];
let leadAlreadyNotified = false;
let isSending = false;

const WELCOME_MESSAGE =
    "Hi! I'm Prince's portfolio assistant. Ask me about his skills, experience, or projects — or leave your email if you'd like him to reach out.";

const ALLOWED_LINK_SCHEMES = ["http:", "https:", "mailto:"];

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function isSafeUrl(url) {
    try {
        return ALLOWED_LINK_SCHEMES.includes(new URL(url, window.location.href).protocol);
    } catch {
        return false;
    }
}

// Minimal, safe markdown -> HTML for bot replies: bold, links, and bullet
// lists. Everything is HTML-escaped first, so only the tags we insert
// ourselves can ever appear in the output.
function renderMarkdown(text) {
    const lines = escapeHtml(text).split("\n");
    let html = "";
    let inList = false;

    for (const rawLine of lines) {
        const line = rawLine.trim();
        const isBullet = /^[-*]\s+/.test(line);

        if (isBullet && !inList) {
            html += "<ul>";
            inList = true;
        } else if (!isBullet && inList) {
            html += "</ul>";
            inList = false;
        }

        if (!isBullet && line === "") continue;

        let content = isBullet ? line.replace(/^[-*]\s+/, "") : line;

        content = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) =>
            isSafeUrl(url)
                ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`
                : label
        );

        html += isBullet ? `<li>${content}</li>` : `${content}<br>`;
    }
    if (inList) html += "</ul>";

    return html.replace(/<br>$/, "");
}

function appendMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = `chat-msg ${role}`;
    if (role === "bot") {
        bubble.innerHTML = renderMarkdown(text);
    } else {
        bubble.textContent = text;
    }
    chatbotMessages.appendChild(bubble);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return bubble;
}

function showTyping() {
    const typing = document.createElement("div");
    typing.className = "chat-typing";
    typing.id = "chat-typing-indicator";
    typing.innerHTML = "<span></span><span></span><span></span>";
    chatbotMessages.appendChild(typing);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById("chat-typing-indicator");
    if (typing) typing.remove();
}

function openChat() {
    chatbotPanel.classList.add("open");
    chatbotInput.focus();
    if (conversation.length === 0) {
        appendMessage("bot", WELCOME_MESSAGE);
    }
}

function closeChat() {
    chatbotPanel.classList.remove("open");
}

chatbotToggle.addEventListener("click", () => {
    chatbotPanel.classList.contains("open") ? closeChat() : openChat();
});

chatbotClose.addEventListener("click", closeChat);

document.addEventListener("click", (e) => {
    if (
        chatbotPanel.classList.contains("open") &&
        !chatbotPanel.contains(e.target) &&
        !chatbotToggle.contains(e.target)
    ) {
        closeChat();
    }
});

chatbotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatbotInput.value.trim();
    if (!text || isSending) return;

    isSending = true;
    chatbotInput.value = "";
    appendMessage("user", text);
    conversation.push({ role: "user", content: text });
    showTyping();

    try {
        const res = await fetch(`${API_BASE_URL}/.netlify/functions/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: conversation,
                leadAlreadyNotified,
            }),
        });

        const data = await res.json();
        hideTyping();

        if (!res.ok) throw new Error(data.error || "Something went wrong.");

        appendMessage("bot", data.reply);
        conversation.push({ role: "assistant", content: data.reply });
        if (data.leadEmailDetected) leadAlreadyNotified = true;
    } catch (err) {
        hideTyping();
        appendMessage("error", err.message || "I couldn't reach the server. Please try again.");
    } finally {
        isSending = false;
    }
});
