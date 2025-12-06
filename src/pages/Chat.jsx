import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchConversation, fetchMessages, sendMessage } from "../services/chatService";

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        await fetchConversation(conversationId); // Ensure it exists / user has access
        const msgs = await fetchMessages(conversationId);
        setMessages(msgs);
      } catch (err) {
        console.error(err);
        setError("Failed to load chat. You may not have access to this conversation.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [conversationId, user, navigate]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    setSending(true);
    setError("");
    try {
      const msg = await sendMessage(conversationId, user.id, input);
      if (msg) {
        setMessages((prev) => [...prev, msg]);
        setInput("");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white border border-emerald-100 rounded-2xl shadow-md flex flex-col h-[70vh]">
        <div className="px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-emerald-900">Chat about this item</h1>
          <button
            className="text-xs text-emerald-700 hover:underline"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-emerald-50/40">
          {messages.length === 0 && (
            <div className="text-xs text-gray-500 text-center mt-4">
              No messages yet. Start the conversation!
            </div>
          )}
          {messages.map((m) => {
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
          })}
        </div>

        <form onSubmit={handleSend} className="border-t border-emerald-100 px-3 py-2 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border border-emerald-100 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="inline-flex items-center px-4 py-2 rounded-full text-sm text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
        {error && (
          <div className="px-4 py-2 text-xs text-red-600 border-t border-red-100 bg-red-50">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
