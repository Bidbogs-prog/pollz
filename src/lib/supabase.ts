import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: {
        getItem: (key: string): string | null => {
          if (typeof window === "undefined") {
            return null;
          }
          const value = document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${key}=`))
            ?.split("=")[1];
          return value || null;
        },
        setItem: (key: string, value: string): void => {
          if (typeof window !== "undefined") {
            document.cookie = `${key}=${value}; path=/; max-age=3600; SameSite=Lax`;
          }
        },
        removeItem: (key: string): void => {
          if (typeof window !== "undefined") {
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
          }
        },
      },
    },
  }
);
