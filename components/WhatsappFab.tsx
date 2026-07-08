export default function WhatsappFab() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919786686928";
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noreferrer"
      title="WhatsApp us"
      className="fixed bottom-6 right-6 z-50 w-13 h-13 w-[52px] h-[52px] rounded-full bg-gold flex items-center justify-center shadow-lg hover:bg-goldLight transition"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#171208" strokeWidth="1.6">
        <path d="M20 12a8 8 0 1 1-3.6-6.7M20 12l-1-4-4 1" />
      </svg>
    </a>
  );
}
