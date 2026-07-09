import { redirect } from "next/navigation";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";
import { packages, frameSizes } from "@/lib/data";
import { statusLabels } from "@/lib/data";
import AdminEditor from "@/components/AdminEditor";
import TelegramBackupButton from "@/components/TelegramBackupButton";
import { isAdminAuthenticated } from "@/lib/adminAuth";

async function getOrders() {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseServiceClient();
  if (!supabase) return null;
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50);
  return data;
}

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const orders = await getOrders();
  const totalRevenue = orders?.reduce((sum, o) => (o.payment_status === "paid" ? sum + o.total_amount : sum), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <h1 className="font-display text-3xl">Admin Dashboard</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href="/api/admin/backup"
            download
            className="btn btn-solid !text-xs !py-2"
            title="Downloads a .sql file with INSERT statements for every table (data-only backup)"
          >
            Download DB Backup
          </a>
          <TelegramBackupButton />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-12">
        <div className="card p-6">
          <p className="text-xs text-muted uppercase tracking-wide mb-2">Orders (last 50)</p>
          <p className="font-display text-2xl text-goldLight">{orders?.length ?? "—"}</p>
        </div>
        <div className="card p-6">
          <p className="text-xs text-muted uppercase tracking-wide mb-2">Revenue (paid orders)</p>
          <p className="font-display text-2xl text-goldLight font-mono">&#8377;{totalRevenue.toLocaleString("en-IN")}</p>
        </div>
        <div className="card p-6">
          <p className="text-xs text-muted uppercase tracking-wide mb-2">Active packages</p>
          <p className="font-display text-2xl text-goldLight">{packages.length}</p>
        </div>
      </div>

      <h2 className="font-display text-lg text-goldLight mb-4">Recent orders</h2>
      {!isSupabaseConfigured() && (
        <p className="text-sm text-muted mb-6 italic">
          Connect Supabase (see .env.example) to see real orders here — run supabase/schema.sql first.
        </p>
      )}

      <div className="border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted uppercase tracking-wide">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((o: any) => (
                <tr key={o.id} className="border-b border-line last:border-b-0">
                  <td className="p-3 font-mono text-goldLight">{o.order_code}</td>
                  <td className="p-3">{o.customer_name}<br /><span className="text-xs text-muted">{o.customer_phone}</span></td>
                  <td className="p-3 capitalize">{o.order_type}</td>
                  <td className="p-3">{statusLabels[o.status as keyof typeof statusLabels] || o.status}</td>
                  <td className="p-3 capitalize">{o.payment_status}</td>
                  <td className="p-3 text-right font-mono">&#8377;{o.total_amount?.toLocaleString("en-IN")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted text-sm">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminEditor supabaseConfigured={isSupabaseConfigured()} />
    </div>
  );
}
