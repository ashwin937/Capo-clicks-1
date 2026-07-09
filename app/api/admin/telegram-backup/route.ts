import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { generateBackupSql } from "@/lib/backup";
import { sendTelegramDocument } from "@/lib/telegram";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    return NextResponse.json(
      { error: "Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in your env vars first." },
      { status: 500 }
    );
  }

  try {
    const { sql, filename, rowCounts, errors } = await generateBackupSql();
    const summary = Object.entries(rowCounts)
      .map(([table, count]) => `${table}: ${count}`)
      .join("\n");
    const caption = `📦 Capo Clicks DB backup (manual)\n${new Date().toISOString()}\n\n${summary}`;

    const result = await sendTelegramDocument({ botToken, chatId, filename, content: sql, caption });
    if (result.ok === false) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({ ok: true, rowCounts, errors });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Backup failed" }, { status: 500 });
  }
}
