import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthService } from "../../auth/hooks/useAuthService";
import { useSocket } from "../SocketContext";
import { getConversations,getMessages , startConversation } from "../service/conversationService";
import { useSearchParams } from "react-router-dom";

function displayName(conversation, currentUserId) {
  return conversation.participants?.find((participant) => participant._id !== currentUserId)?.username || "Conversation";
}

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthService();
  const socketRef = useSocket();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(Boolean(conversationId));
  const [error, setError] = useState("");
  const endOfMessagesRef = useRef(null);

  const [searchParams] = useSearchParams();
  const otherUserId = searchParams.get("with");
  

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation._id === conversationId),
    [conversations, conversationId]
  );

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const data = await getConversations();
      setConversations(data.conversations || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not load conversations.");
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadConversations);
  }, [loadConversations]);

  useEffect(() => {
    // If we are already inside a conversation, or no owner was passed, do nothing.
    if (conversationId || !otherUserId) return;
  
    async function openConversation() {
      try {
        const data = await startConversation(otherUserId);
  
        // Navigate to the conversation returned by the backend
        navigate(`/chat/${data.conversation._id}`, {
          replace: true,
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not start conversation."
        );
      }
    }
  
    openConversation();
  }, [conversationId, otherUserId, navigate]);

  useEffect(() => {
    if (!conversationId) {
      queueMicrotask(() => {
        setMessages([]);
        setLoadingMessages(false);
      });
      return undefined;
    }

    let active = true;
    queueMicrotask(() => {
      if (active) {
        setLoadingMessages(true);
        setError("");
      }
    });
    getMessages(conversationId)
      .then((data) => { if (active) setMessages(data.messages || []); })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || "Could not load messages.");
      })
      .finally(() => { if (active) setLoadingMessages(false); });

    const socket = socketRef.current;
    const receiveMessage = (message) => {
      if (message.conversation === conversationId || message.conversation?._id === conversationId) {
        setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]);
      }
      loadConversations();
    };
    const join = () => socket?.emit("join_conversation", { conversationId });
    socket?.on("connect", join);
    socket?.on("receive_message", receiveMessage);
    if (socket?.connected) join();

    return () => {
      active = false;
      socket?.emit("leave_conversation", { conversationId });
      socket?.off("connect", join);
      socket?.off("receive_message", receiveMessage);
    };
  }, [conversationId, loadConversations, socketRef]);

  useEffect(() => { endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();
    const text = draft.trim();
    const socket = socketRef.current;
    if (!text || !conversationId || !socket?.connected) return;

    setDraft("");
    socket.emit("send_message", { conversationId, text }, (result) => {
      if (!result?.ok) {
        setDraft(text);
        setError(result?.message || "Message could not be sent.");
      }
    });
  };

  
  return (
    <main className="bg-cream min-h-[calc(100vh-5rem)] p-4 sm:p-6">
      <section className="max-w-6xl h-[calc(100vh-8rem)] min-h-[520px] mx-auto bg-white border border-border-brand rounded-2xl shadow-sm overflow-hidden grid md:grid-cols-[19rem_1fr]">
        <aside className="border-b md:border-b-0 md:border-r border-border-brand overflow-y-auto">
          <div className="p-5 border-b border-border-brand"><h1 className="font-display text-2xl text-bark-dark">Messages</h1></div>
          {loadingConversations ? <p className="p-5 text-text-mid">Loading conversations...</p> : conversations.length === 0 ? <p className="p-5 text-text-mid">No conversations yet.</p> : conversations.map((conversation) => (
            <button key={conversation._id} onClick={() => navigate(`/chat/${conversation._id}`)} className={`w-full text-left p-4 border-b border-warm hover:bg-cream transition-colors ${conversation._id === conversationId ? "bg-sage-light" : ""}`}>
              <p className="font-medium text-bark-dark truncate">{displayName(conversation, user?._id)}</p>
              <p className="text-sm text-text-light truncate mt-1">{conversation.lastMessage || "Start the conversation"}</p>
            </button>
          ))}
        </aside>

        <div className="flex flex-col min-w-0">
          {conversationId ? <>
            <header className="p-5 border-b border-border-brand"><p className="font-medium text-bark-dark">{displayName(activeConversation || {}, user?._id)}</p></header>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-cream/50">
              {loadingMessages ? <p className="text-text-mid">Loading messages...</p> : messages.map((message) => {
                const ownMessage = message.sender?._id === user?._id || message.sender === user?._id;
                return <div key={message._id} className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${ownMessage ? "bg-rust text-white rounded-br-sm" : "bg-white text-text-main border border-warm rounded-bl-sm"}`}>{message.text}</div></div>;
              })}
              <div ref={endOfMessagesRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-border-brand flex gap-3">
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl border border-border-brand px-4 py-3 outline-none focus:ring-2 focus:ring-rust/30" />
              <button type="submit" disabled={!draft.trim()} className="rounded-xl bg-rust px-5 text-white font-medium disabled:opacity-50">Send</button>
            </form>
          </> : <div className="flex-1 flex items-center justify-center text-text-mid p-6 text-center">Choose a conversation or message an owner from a pet listing.</div>}
          {error && <p className="absolute bottom-5 right-5 max-w-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</p>}
        </div>
      </section>
    </main>
  );
}
