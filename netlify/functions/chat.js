const { Resend } = require("resend");
const { PORTFOLIO_CONTEXT } = require("./portfolio-context");

const QWEN_BASE_URL =
  process.env.QWEN_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const QWEN_MODEL = process.env.QWEN_MODEL || "qwen-plus";
const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2000;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function sanitizeMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) return null;

  const cleaned = rawMessages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }));

  return cleaned.length > 0 ? cleaned : null;
}

async function notifyLead(latestUserMessage, conversationExcerpt) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL || "princedagogoekine@gmail.com";
  const from = process.env.RESEND_FROM_EMAIL || "Portfolio Bot <onboarding@resend.dev>";

  if (!apiKey) return;

  const [detectedEmail] = latestUserMessage.match(EMAIL_REGEX) || [];
  if (!detectedEmail) return;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to,
    replyTo: detectedEmail,
    subject: "New chatbot lead from your portfolio",
    html: `
      <p>A visitor shared their email while chatting with your portfolio AI assistant.</p>
      <p><strong>Email:</strong> ${detectedEmail}</p>
      <p><strong>Recent conversation:</strong></p>
      <pre style="white-space:pre-wrap;font-family:inherit;">${conversationExcerpt}</pre>
    `,
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: JSON_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    console.error("Missing QWEN_API_KEY environment variable");
    return respond(500, { error: "Chatbot is not configured yet." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return respond(400, { error: "Invalid JSON body" });
  }

  const messages = sanitizeMessages(payload.messages);
  if (!messages) {
    return respond(400, { error: "messages must be a non-empty array" });
  }

  let reply;
  try {
    const upstream = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [{ role: "system", content: PORTFOLIO_CONTEXT }, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("Qwen API error:", upstream.status, errText);
      return respond(502, { error: "Chatbot service is temporarily unavailable." });
    }

    const data = await upstream.json();
    reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return respond(502, { error: "Chatbot returned an empty response." });
    }
  } catch (err) {
    console.error("Failed to reach Qwen API:", err);
    return respond(502, { error: "Chatbot service is temporarily unavailable." });
  }

  let leadEmailDetected = false;
  if (!payload.leadAlreadyNotified) {
    const latestUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (latestUserMessage && EMAIL_REGEX.test(latestUserMessage.content)) {
      leadEmailDetected = true;
      const excerpt = [...messages, { role: "assistant", content: reply }]
        .map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.content}`)
        .join("\n");
      try {
        await notifyLead(latestUserMessage.content, excerpt);
      } catch (err) {
        console.error("Failed to send lead notification email:", err);
      }
    }
  }

  return respond(200, { reply, leadEmailDetected });
};
