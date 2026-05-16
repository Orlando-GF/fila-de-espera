import { AppFrame } from "@/components/app-frame";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <AppFrame userEmail={user?.email}>{children}</AppFrame>;
}
