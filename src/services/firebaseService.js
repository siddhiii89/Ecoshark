// src/services/firebaseService.js (now powered by Supabase)
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabaseClient";

/**
 * Uploads image file to Supabase Storage and creates a row in 'donations' table.
 * file: File from input
 * data: { title, description, category, condition, age, location: { city, zip } }
 * userId: optional
 * userEmail: optional donor email for mailto
 * ai: optional { label, confidence }
 */
export async function uploadImageAndCreatePost(file, data, userId = null, userEmail = null, ai = null) {
  if (!file) throw new Error("No file provided");

  const id = uuidv4();
  const path = `donation_images/${userId || "anon"}/${id}.jpg`;

  // Upload to Supabase Storage bucket 'donation-images'
  const { error: uploadError } = await supabase
    .storage
    .from("donation-images")
    .upload(path, file, { upsert: false });

  if (uploadError) {
    throw uploadError;
  }

  const { data: urlData } = supabase
    .storage
    .from("donation-images")
    .getPublicUrl(path);

  const url = urlData?.publicUrl;

  const payload = {
    title: data.title || "Donation",
    description: data.description || "",
    category: data.category || "",
    condition: data.condition || "Fair",
    age: data.age || "",
    location: {
      city: data.location?.city || "",
      zip: data.location?.zip || ""
    },
    imageUrl: url,
    createdAt: new Date().toISOString(),
    is_for_sale: false,
    userId: userId || null,
    userEmail: userEmail || null,
    ai: ai || null
  };

  const { data: rows, error: insertError } = await supabase
    .from("donations")
    .insert(payload)
    .select();

  if (insertError) {
    throw insertError;
  }

  const row = rows?.[0];
  return { docId: row?.id, url };
}

