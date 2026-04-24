export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: corsHeaders(),
        });
      }
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
      }
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { formName, fields, botField } = payload ?? {};

  if (botField) return json({ ok: true }, 200);

  if (!formName || !fields || typeof fields !== "object") {
    return json({ error: "Missing formName or fields" }, 400);
  }

  const email = String(fields.email ?? "").trim();
  const name = String(fields.name ?? "").trim();
  const message = String(fields.message ?? "").trim();
  if (!email || !name || !message) {
    return json({ error: "Missing required fields" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Invalid email" }, 400);
  }

  const to = env.CONTACT_TO_EMAIL;
  const from = env.CONTACT_FROM_EMAIL || "BBCI <onboarding@resend.dev>";
  if (!env.RESEND_API_KEY || !to) {
    return json({ error: "Email service not configured" }, 500);
  }

  const subjectMap = {
    "bbci-farmer-enrollment": "New farmer enrollment inquiry",
    "bbci-partnership": "New partnership inquiry",
    "bbci-pilot-support": "New pilot support inquiry",
  };
  const subject = subjectMap[formName] || `New inquiry (${formName})`;

  const rows = Object.entries(fields)
    .filter(([k]) => k !== "bot-field")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;vertical-align:top;color:#555"><strong>${escapeHtml(k)}</strong></td><td style="padding:4px 0">${escapeHtml(String(v ?? "")).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");

  const html = `<div style="font-family:system-ui,sans-serif;color:#111"><h2 style="margin:0 0 12px">${escapeHtml(subject)}</h2><p style="margin:0 0 12px;color:#555">Submitted via <code>${escapeHtml(formName)}</code></p><table>${rows}</table></div>`;

  const text = Object.entries(fields)
    .filter(([k]) => k !== "bot-field")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: email,
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return json({ error: "Failed to send", detail }, 502);
  }

  return json({ ok: true }, 200);
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
