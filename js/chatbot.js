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

function appendMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = `chat-msg ${role}`;
    bubble.textContent = text;
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
