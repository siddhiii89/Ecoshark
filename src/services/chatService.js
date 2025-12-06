import { supabase } from "../supabaseClient";

// Create or get a conversation between current user and donor for a donation
export async function getOrCreateConversation({ donationId, currentUserId, donorId }) {
  if (!donationId || !currentUserId || !donorId) {
    throw new Error("Missing required ids for conversation");
  }

  // Try to find an existing conversation for this donation with both participants
  const { data: existingConversations, error: convError } = await supabase
    .from("conversations")
    .select("id, conversation_participants!inner(user_id)")
    .eq("donation_id", donationId)
    .eq("conversation_participants.user_id", currentUserId);

  if (convError) {
    console.error("Failed to fetch conversations", convError);
  }

  if (existingConversations && existingConversations.length > 0) {
    // Just return the first one
    return existingConversations[0].id;
  }

  // Create a new conversation
  const { data: convData, error: createError } = await supabase
    .from("conversations")
    .insert({ donation_id: donationId, created_by: currentUserId })
    .select("id")
    .single();

  if (createError || !convData) {
    console.error("Failed to create conversation", createError);
    throw createError || new Error("Failed to create conversation");
  }

  const conversationId = convData.id;

  // Add participants: donor and current user
  const participantsPayload = [
    { conversation_id: conversationId, user_id: currentUserId },
    { conversation_id: conversationId, user_id: donorId },
  ];

  const { error: participantsError } = await supabase
    .from("conversation_participants")
    .insert(participantsPayload);

  if (participantsError) {
    console.error("Failed to add conversation participants", participantsError);
    // We still return the conversation id so user is not blocked completely
  }

  return conversationId;
}

export async function fetchConversation(conversationId) {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, donation_id, created_by")
    .eq("id", conversationId)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchMessages(conversationId) {
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendMessage(conversationId, senderId, content) {
  if (!content.trim()) return null;

  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, content: content.trim() })
    .select("id, sender_id, content, created_at")
    .single();

  if (error) throw error;
  return data;
}
