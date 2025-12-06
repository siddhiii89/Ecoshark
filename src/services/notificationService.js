import { supabase } from "../supabaseClient";

export async function createNotification({ userId, title, description, link }) {
  if (!userId) return;

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    description,
    link,
  });

  if (error) {
    console.error("Failed to create notification", error);
  }
}

export async function fetchNotificationsForUser(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, description, link, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Failed to fetch notifications", error);
    return [];
  }

  return data || [];
}
