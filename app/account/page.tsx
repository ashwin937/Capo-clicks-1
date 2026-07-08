export default function AccountPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="eyebrow mb-2">Account</div>
      <h1 className="font-display text-3xl mb-6">Your Orders</h1>
      <p className="text-muted text-sm mb-8">
        No login needed — track any order any time from the Track Order page using your Order ID and phone
        number. Full customer accounts (saved addresses, order history without re-entering details) get
        added once Supabase Auth is wired in — the schema in <code>supabase/schema.sql</code> already
        supports it.
      </p>
      <a href="/track" className="btn btn-solid">Track an Order</a>
    </div>
  );
}
