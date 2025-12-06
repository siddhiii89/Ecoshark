// src/services/feedbackService.js
import { supabase } from "../supabaseClient";

// Record simple post-exchange feedback for a donation item
export async function submitItemFeedback(donationId, matchesDescription, comment) {
  const payload = {
    donation_id: donationId,
    matches_description: !!matchesDescription,
    comment: comment || null,
  };

  const { data, error } = await supabase
    .from("item_feedback")
    .insert(payload)
    .select();

  if (error) throw error;
  return data?.[0] || null;
}
