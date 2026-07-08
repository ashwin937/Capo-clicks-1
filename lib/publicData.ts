import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";
import { frameSizes as fallbackFrameSizes, packages as fallbackPackages, quoteServices as fallbackQuoteServices } from "@/lib/data";
import type { FrameSize, Package, QuoteService } from "@/lib/data";

export async function getFrameSizes(): Promise<FrameSize[]> {
  if (!isSupabaseConfigured()) return fallbackFrameSizes;
  const supabase = getSupabaseServiceClient();
  if (!supabase) return fallbackFrameSizes;
  const { data, error } = await supabase
    .from("frame_sizes")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });
  if (error || !data || data.length === 0) return fallbackFrameSizes;
  return data;
}

export async function getPackages(): Promise<Package[]> {
  if (!isSupabaseConfigured()) return fallbackPackages;
  const supabase = getSupabaseServiceClient();
  if (!supabase) return fallbackPackages;
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });
  if (error || !data || data.length === 0) return fallbackPackages;
  return data;
}

export async function getQuoteServices(): Promise<QuoteService[]> {
  if (!isSupabaseConfigured()) return fallbackQuoteServices;
  const supabase = getSupabaseServiceClient();
  if (!supabase) return fallbackQuoteServices;
  const { data, error } = await supabase
    .from("quote_services")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error || !data || data.length === 0) return fallbackQuoteServices;
  return data;
}
