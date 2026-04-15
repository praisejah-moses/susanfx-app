import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import type { NotificationPrefsRow } from "../types/database";

export interface UseNotificationPrefs {
  prefs: NotificationPrefsRow | null;
  loading: boolean;
  save: (prefs: Omit<NotificationPrefsRow, "user_id">) => Promise<string | null>;
}

export function useNotificationPrefs(userId: string | undefined): UseNotificationPrefs {
  const [prefs, setPrefs] = useState<NotificationPrefsRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase
      .from("notification_prefs")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setPrefs(data);
        setLoading(false);
      });
  }, [userId]);

  const save = useCallback(
    async (values: Omit<NotificationPrefsRow, "user_id">) => {
      if (!userId) return "Not authenticated";
      const { error } = await supabase
        .from("notification_prefs")
        .upsert({ user_id: userId, ...values });
      if (error) return error.message;
      setPrefs({ user_id: userId, ...values });
      return null;
    },
    [userId],
  );

  return { prefs, loading, save };
}
