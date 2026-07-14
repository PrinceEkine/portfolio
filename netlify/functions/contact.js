const { Resend } = require("resend");

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MAX_FIELD_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: JSON_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY environment variable");
    return respond(500, { error: "Contact form is not configured yet." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return respond(400, { error: "Invalid JSON body" });
  }

  const name = String(payload.name || "").trim().slice(0, MAX_FIELD_LENGTH);
  const email = String(payload.email || "").trim().slice(0, MAX_FIELD_LENGTH);
  const message = String(payload.message || "").trim().slice(0, MAX_MESSAGE_LENGTH);

  if (!name || !email || !message) {
    return respond(400, { error: "Name, email, and message are all required." });
  }
  if (!EMAIL_REGEX.test(email)) {
    return respond(400, { error: "Please provide a valid email address." });
  }

  const to = process.env.CONTACT_EMAIL || "princedagogoekine@gmail.com";
  const from = process.env.RESEND_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New portfolio message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return respond(502, { error: "Failed to send your message. Please try again." });
    }
  } catch (err) {
    console.error("Failed to send contact email:", err);
    return respond(502, { error: "Failed to send your message. Please try again." });
  }

  return respond(200, { success: true });
};
