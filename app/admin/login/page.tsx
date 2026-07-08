"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display text-2xl text-center mb-8">Admin Login</h1>
      <form onSubmit={handleSubmit} className="card p-8 space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="w-full bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="btn btn-solid w-full">Log In</button>
      </form>
    </div>
  );
}
