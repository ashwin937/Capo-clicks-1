"use client";

import { useState } from "react";

export default function TelegramBackupButton() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleClick() {
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/admin/telegram-backup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setMessage(data?.error || "Failed to send");
        return;
      }
      setState("sent");
      setMessage("Sent to Telegram ✓");
    } catch (err: any) {
      setState("error");
      setMessage(err?.message || "Failed to send");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={state === "sending"}
        className="btn btn-outline !text-xs !py-2 disabled:opacity-40"
      >
        {state === "sending" ? "Sending…" : "Send Backup to Telegram Now"}
      </button>
      {message && (
        <span className={`text-xs ${state === "error" ? "text-red-400" : "text-muted"}`}>{message}</span>
      )}
    </div>
  );
}
