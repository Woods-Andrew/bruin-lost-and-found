import { supabaseConfigured } from "@/lib/config";
import { demoStore } from "@/lib/store/demo";
import { supabaseStore } from "@/lib/store/supabase";
import type { AppStore } from "@/lib/store/types";

export function getStore(): AppStore {
  return supabaseConfigured() ? supabaseStore : demoStore;
}

export { supabaseConfigured };
