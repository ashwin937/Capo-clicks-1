"use client";

import { useState } from "react";

export default function ContactClient() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Wire this up to an email/SMS API (e.g. Resend) once you have a key.
    setSent(true);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <div className="eyebrow mb-2">Get in touch</div>
        <h1 className="font-display text-3xl md:text-4xl">Contact Us</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="card p-8">
          {sent ? (
            <p className="text-goldLight font-display text-lg">Thanks — we&apos;ll get back to you shortly.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold" />
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="w-full bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold" />
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message" rows={5} className="w-full bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold" />
              <button type="submit" className="btn btn-solid w-full">Send Message</button>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-display text-goldLight text-sm mb-2">Phone</h3>
            <p className="text-sm text-muted">+91 97866 86928</p>
            <p className="text-sm text-muted">+91 93453 23179</p>
          </div>
          <div>
            <h3 className="font-display text-goldLight text-sm mb-2">Email</h3>
            <a href="mailto:capoclicks@gmail.com" className="text-sm text-muted hover:text-goldLight">
              capoclicks@gmail.com
            </a>
          </div>
          <div>
            <h3 className="font-display text-goldLight text-sm mb-2">Location</h3>
            <p className="text-sm text-muted">Coimbatore, Tamil Nadu, India</p>
          </div>
          <div>
            <h3 className="font-display text-goldLight text-sm mb-2">Instagram</h3>
            <a href="https://www.instagram.com/_capo_clicks" target="_blank" rel="noreferrer" className="text-sm text-muted hover:text-goldLight">
              @_capo_clicks
            </a>
          </div>
          <div className="aspect-video border border-line flex items-center justify-center text-xs text-muted">
            Embed a Google Map here with your studio address
          </div>
        </div>
      </div>
    </div>
  );
}
