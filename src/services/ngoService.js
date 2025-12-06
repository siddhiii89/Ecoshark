// src/services/ngoService.js
import { supabase } from "../supabaseClient";

// Upload NGO document to Supabase Storage and create/update NGO request row
// user may be null immediately after signup if email confirmation is required; we always store email
export async function submitNgoApplication(user, file, email) {
  const userId = user?.id || null;
  const safeEmail = email || user?.email || null;

  if (!safeEmail) throw new Error("Email is required for NGO application");

  let docUrl = null;

  if (file) {
    const path = `ngo_docs/${userId || "pending"}/${file.name}`;
    const { error: uploadError } = await supabase
      .storage
      .from("ngo-docs")
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("ngo-docs").getPublicUrl(path);
    docUrl = urlData?.publicUrl || null;
  }

  const payload = {
    user_id: userId,
    email: safeEmail,
    doc_url: docUrl,
    status: "pending",
    ngo_enabled: false,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("ngo_requests")
    .insert(payload)
    .select();

  if (error) throw error;
  return data?.[0] || null;
}

// Fetch NGO request for a specific user
export async function fetchMyNgoRequest(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("ngo_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
}

// Admin: list all NGO requests
export async function fetchAllNgoRequests() {
  const { data, error } = await supabase
    .from("ngo_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Admin: update NGO request status / enable flag
export async function updateNgoRequest(id, updates) {
  const { data, error } = await supabase
    .from("ngo_requests")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data?.[0] || null;
}
