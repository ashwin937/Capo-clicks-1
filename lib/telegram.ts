// Minimal Telegram Bot API client — just enough to push a text file to a
// chat. No SDK dependency needed; the Bot API is plain HTTPS + multipart.

export type TelegramSendResult = { ok: true } | { ok: false; error: string };

export async function sendTelegramDocument(opts: {
  botToken: string;
  chatId: string;
  filename: string;
  content: string;
  caption?: string;
}): Promise<TelegramSendResult> {
  const { botToken, chatId, filename, content, caption } = opts;

  const form = new FormData();
  form.append("chat_id", chatId);
  if (caption) form.append("caption", caption.slice(0, 1024)); // Telegram caption limit
  form.append("document", new Blob([content], { type: "application/sql" }), filename);

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
    method: "POST",
    body: form
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    const desc = data?.description || `HTTP ${res.status}`;
    return { ok: false, error: `Telegram API error: ${desc}` };
  }

  return { ok: true };
}

export async function sendTelegramMessage(opts: {
  botToken: string;
  chatId: string;
  text: string;
}): Promise<TelegramSendResult> {
  const { botToken, chatId, text } = opts;

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    const desc = data?.description || `HTTP ${res.status}`;
    return { ok: false, error: `Telegram API error: ${desc}` };
  }

  return { ok: true };
}
