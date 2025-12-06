import React, { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { submitItemFeedback } from "../services/feedbackService";
import { useAuth } from "../contexts/AuthContext";
import { getOrCreateConversation, fetchMessages, sendMessage } from "../services/chatService";
import { createNotification } from "../services/notificationService";

export default function ItemDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMatch, setFeedbackMatch] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatError, setChatError] = useState("");
  const [otherEmail, setOtherEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setItem(data);
      }
      setLoading(false);
    })();
  }, [id]);

  const openChatParam = searchParams.get("openChat");
  const fromEmailParam = searchParams.get("from");

  useEffect(() => {
    if (fromEmailParam) {
      setOtherEmail(fromEmailParam);
    }
  }, [fromEmailParam]);

  const donorId = item ? (item.userId || item.user_id || item.owner_id || null) : null;
  const isOwner = user && donorId && user.id === donorId;

  const handleOpenChat = useCallback(async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      const donorId = item.userId || item.user_id || item.owner_id || null;
      if (!donorId) {
        alert("Chat is not available for this item.");
        return;
      }
      const conversationId = await getOrCreateConversation({
        donationId: id,
        currentUserId: user.id,
        donorId,
      });

      // Create a simple in-app notification for the owner
      if (donorId !== user.id) {
        await createNotification({
          userId: donorId,
          title: "Someone is interested in your item",
          description: `${user.email || "A user"} started a chat about "${item.title || "your donation"}"`,
          link: `/listings/${id}`,
        });
      }

      // Set other party email if we know it
      if (!isOwner && (item.userEmail || item.ownerEmail)) {
        setOtherEmail(item.userEmail || item.ownerEmail);
      }

      setConversationId(conversationId);
      setChatOpen(true);
      setChatLoading(true);
      setChatError("");
      try {
        const msgs = await fetchMessages(conversationId);
        setMessages(msgs);
      } catch (err) {
        console.error(err);
        setChatError("Failed to load chat messages.");
      } finally {
        setChatLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to open chat. Please try again later.");
    }
  }, [user, id, item, isOwner]);

  useEffect(() => {
    if (!item) return;
    if (openChatParam === "1" || openChatParam === "true") {
      handleOpenChat();
    }
  }, [item, openChatParam, handleOpenChat]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-300" /></div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center text-gray-500">Not found</div>;

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !conversationId || !user) return;

    try {
      const msg = await sendMessage(conversationId, user.id, chatInput);
      if (msg) {
        setMessages((prev) => [...prev, msg]);
        setChatInput("");
      }
    } catch (err) {
      console.error(err);
      setChatError("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-emerald-100 rounded-2xl p-4 sm:p-6 lg:p-8 soft-fade-in-up shadow-md relative">
          <img src={item.imageUrl} alt={item.title} className="w-full max-h-[420px] object-contain rounded-xl bg-emerald-50" />
          <h1 className="text-2xl font-semibold mt-4 text-emerald-900">{item.title}</h1>
          <p className="text-gray-700 mt-2">{item.description}</p>
        <div className="mt-2 text-sm text-gray-600">Age: {item.age || 'N/A'}</div>
        <div className="mt-1 text-sm text-gray-600">Location: {item.location?.city || ''} {item.location?.zip || ''}</div>
        <div className="mt-1 text-sm text-gray-600">Category: {item.category || ''} • Condition: {item.condition || ''}</div>
        {item.ai?.label && (
          <div className="mt-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800">
            AI: {item.ai.label} ({item.ai.confidence ? Math.round(item.ai.confidence * 100) : 0}% confidence)
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {isOwner ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center px-4 py-2 rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
            >
              This is your item
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenChat}
              className="inline-flex items-center px-4 py-2 rounded-md text-emerald-900 bg-emerald-200 hover:bg-emerald-300 soft-scale-hover"
            >
              Open Chat with Donor
            </button>
          )}
        </div>
        {/* Simple post-exchange feedback */}
        <div className="mt-8 border-t border-emerald-100 pt-6">
          <h2 className="text-lg font-semibold text-emerald-900 mb-2">Did this item match the description?</h2>
          {feedbackSubmitted ? (
            <div className="text-sm text-emerald-800">Thanks for your feedback!</div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setFeedbackError("");
                if (!feedbackMatch) {
                  setFeedbackError("Please choose Yes or No.");
                  return;
                }
                try {
                  await submitItemFeedback(id, feedbackMatch === "yes", feedbackComment.trim());
                  setFeedbackSubmitted(true);
                } catch (err) {
                  console.error(err);
                  setFeedbackError("Failed to submit feedback. Please try again later.");
                }
              }}
            >
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="match"
                    value="yes"
                    checked={feedbackMatch === "yes"}
                    onChange={() => setFeedbackMatch("yes")}
                  />
                  <span>Yes</span>
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="match"
                    value="no"
                    checked={feedbackMatch === "no"}
                    onChange={() => setFeedbackMatch("no")}
                  />
                  <span>No</span>
                </label>
              </div>
              <div>
                <textarea
                  className="mt-2 w-full border border-emerald-100 rounded-md px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Optional: Share a short comment about the item quality or condition."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />
              </div>
              {feedbackError && (
                <div className="text-xs text-red-600">{feedbackError}</div>
              )}
              <button
                type="submit"
                className="mt-2 inline-flex items-center px-4 py-2 rounded-md text-emerald-900 bg-emerald-200 hover:bg-emerald-300 soft-scale-hover text-sm"
              >
                Submit feedback
              </button>
            </form>
          )}
        </div>

        {/* Chat popup modal */}
        {chatOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-emerald-100 flex flex-col max-h-[80vh]">
              <div className="px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-emerald-900">
                  {otherEmail ? `Chat with ${otherEmail}` : "Chat about this item"}
                </h2>
                <button
                  type="button"
                  className="text-xs text-gray-500 hover:text-gray-700"
                  onClick={() => setChatOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 bg-emerald-50/40 space-y-2 text-sm">
                {chatLoading ? (
                  <div className="text-xs text-gray-500">Loading chat...</div>
                ) : messages.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center mt-4">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-xl px-3 py-2 text-sm shadow-sm ${
                            isMe
                              ? "bg-emerald-200 text-emerald-900"
                              : "bg-white border border-emerald-100 text-gray-800"
                          }`}
                        >
                          <div className="text-[11px] font-semibold mb-1 text-gray-700">
                            {isMe ? "You" : "Other user"}
                          </div>
                          <div>{m.content}</div>
                          <div className="mt-1 text-[10px] text-gray-500 text-right">
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={handleSendChatMessage} className="border-t border-emerald-100 px-3 py-2 flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 border border-emerald-100 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
              {chatError && (
                <div className="px-4 py-2 text-xs text-red-600 border-t border-red-100 bg-red-50">
                  {chatError}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
