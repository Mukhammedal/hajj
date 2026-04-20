import "server-only";

const defaultWhapiBaseUrl = "https://gate.whapi.cloud";

export function getWhapiBaseUrl() {
  return process.env.WHAPI_BASE_URL?.trim() || defaultWhapiBaseUrl;
}

export function getWhapiApiKey() {
  return process.env.WHATSAPP_API_KEY?.trim() || "";
}

export function isWhapiConfigured() {
  return Boolean(getWhapiApiKey());
}

export function normalizeWhatsAppRecipient(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  if (digits.length === 10) {
    return `7${digits}`;
  }

  return digits;
}

export async function sendWhapiTextMessage({
  body,
  to,
}: {
  body: string;
  to: string;
}) {
  const apiKey = getWhapiApiKey();

  if (!apiKey) {
    throw new Error("WHATSAPP_API_KEY не задан.");
  }

  const response = await fetch(`${getWhapiBaseUrl()}/messages/text`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      body,
      typing_time: 0,
    }),
    cache: "no-store",
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(payload?.message ?? payload?.error?.message ?? (text || "Whapi.Cloud request failed."));
  }

  return payload;
}
