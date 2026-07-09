import { NextRequest, NextResponse } from "next/server";
import { generateBackupSql } from "@/lib/backup";
import { sendTelegramDocument, sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

// Called on a schedule by Vercel Cron (see vercel.json). Vercel signs cron
// requests with `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is
// set as an env var — we check that here so this endpoint can't be hit by
// randoms to spam your Telegram chat or hammer Supabase.
function isAuthorizedCronRequest(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed if not configured
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set" },
      { status: 500 }
    );
  }

  try {
    const { sql, filename, rowCounts, errors } = await generateBackupSql();

    const summary = Object.entries(rowCounts)
      .map(([table, count]) => `${table}: ${count}`)
      .join("\n");
    const caption =
      `📦 Capo Clicks DB backup\n${new Date().toISOString()}\n\n${summary}` +
      (errors.length ? `\n\n⚠️ Errors: ${errors.join("; ")}` : "");

    const result = await sendTelegramDocument({ botToken, chatId, filename, content: sql, caption });

    if (result.ok === false) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({ ok: true, filename, rowCounts, errors });
  } catch (err: any) {
    // Best-effort: also try to notify Telegram that the backup itself failed
    const message = err?.message || "Backup generation failed";
    await sendTelegramMessage({
      botToken,
      chatId,
      text: `❌ Capo Clicks DB backup failed: ${message}`
    }).catch(() => {});
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
