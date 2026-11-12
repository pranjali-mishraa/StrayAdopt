
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useAuthService } from "../../auth/hooks/useAuthService";
import { NgoAuthContext } from "../../ngo/context/NgoAuthContext";

import { useSocket } from "../SocketContext";

import {
  getMyConversations,
  getConversationMessages,
  startConversation
} from "../service/conversationService";


function getParticipantDetails(participant) {
  // New polymorphic participant structure
  const account = participant?.participantId;

  if (account && typeof account === "object") {
    return {
      id: account._id,
      name: account.username || account.name || account.email || "Conversation",
      model: participant.participantModel
    };
  }

  // Backward compatibility with older participant structure
  return {
    id: participant?._id,
    name: participant?.username || participant?.name || "Conversation",
    model: "User"
  };
}


function displayName(conversation, currentAccountId) {
  const otherParticipant = conversation.participants?.find((participant) => {
    const details = getParticipantDetails(participant);
    return details.id?.toString() !== currentAccountId?.toString();
  });

  return otherParticipant
    ? getParticipantDetails(otherParticipant).name
    : "Conversation";
}


export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuthService();
  const { ngo } = useContext(NgoAuthContext);

  const activeAccount = sessionStorage.getItem("activeAccount");

const currentAccount =
    activeAccount === "Ngo"
        ? ngo
        : activeAccount === "User"
            ? user
            : null;

const currentAccountId = currentAccount?._id;

const currentModel = activeAccount === "Ngo" ? "Ngo" : "User";
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
  const otherUserModel = searchParams.get("withModel") || "User";


  // Find currently selected conversation
  const activeConversation = useMemo(
    () => conversations.find(
      (conversation) => conversation._id === conversationId
    ),
    [conversations, conversationId]
  );


  // Fetch all conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);

      const data = await getMyConversations();

      setConversations(data.conversations || []);

    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
        "Could not load conversations."
      );
    } finally {
      setLoadingConversations(false);
    }
  }, []);


  useEffect(() => {
    loadConversations();
  }, [loadConversations]);


  // Start or retrieve an existing conversation
  useEffect(() => {
    if (conversationId || !otherUserId) return;

    let active = true;

    async function openConversation() {
      try {
        const data = await startConversation(
          otherUserId,
          otherUserModel
        );

        if (!active) return;

        navigate(`/chat/${data.conversation._id}`, {
          replace: true
        });

      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            "Could not start conversation."
          );
        }
      }
    }

    openConversation();

    return () => {
      active = false;
    };

  }, [
    conversationId,
    otherUserId,
    otherUserModel,
    navigate
  ]);


  // Fetch messages and join Socket.IO room
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    let active = true;

    setLoadingMessages(true);
    setError("");

    getConversationMessages(conversationId)
      .then((data) => {
        if (!active) return;

        // Merge history with any messages received while loading
        setMessages((current) => {
          const combined = [...(data.messages || []), ...current];

          const uniqueMessages = Array.from(
            new Map(
              combined.map((message) => [message._id, message])
            ).values()
          );

          return uniqueMessages.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError?.response?.data?.message ||
            "Could not load messages."
          );
        }
      })
      .finally(() => {
        if (active) setLoadingMessages(false);
      });


    const socket = socketRef.current;

    // Receive real-time messages
    const receiveMessage = (message) => {
      const messageConversationId =
        message.conversation?._id || message.conversation;

      if (messageConversationId?.toString() === conversationId) {
        setMessages((current) => {
          if (current.some((item) => item._id === message._id)) {
            return current;
          }

          return [...current, message];
        });
      }

      loadConversations();
    };


    // Join room after socket connects
    const joinConversation = () => {
      socket.emit("join_conversation", { conversationId });
    };

    socket?.on("connect", joinConversation);
    socket?.on("receive_message", receiveMessage);

    if (socket?.connected) {
      joinConversation();
    }


    return () => {
      active = false;

      socket?.emit("leave_conversation", { conversationId });

      socket?.off("connect", joinConversation);
      socket?.off("receive_message", receiveMessage);
    };

  }, [conversationId, loadConversations, socketRef]);


  // Auto-scroll to latest message
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);


  // Send real-time message
  const sendMessage = (event) => {
    event.preventDefault();

    const text = draft.trim();
    const socket = socketRef.current;

    if (!text || !conversationId) return;

    if (!socket?.connected) {
      setError("Chat connection unavailable. Please try again.");
      return;
    }

    setDraft("");
    setError("");

    socket.emit(
      "send_message",
      { conversationId, text },
      (result) => {
        if (!result?.ok) {
          setDraft(text);

          setError(
            result?.message || "Message could not be sent."
          );
        }
      }
    );
  };


  return (
    <main className="bg-cream min-h-[calc(100vh-5rem)] p-4 sm:p-6">

      <section className="max-w-6xl h-[calc(100vh-8rem)] min-h-[520px] mx-auto bg-white border border-border-brand rounded-2xl shadow-sm overflow-hidden grid md:grid-cols-[19rem_1fr]">

        {/* Conversation list */}
        <aside className="border-b md:border-b-0 md:border-r border-border-brand overflow-y-auto">

          <div className="p-5 border-b border-border-brand">
            <h1 className="font-display text-2xl text-bark-dark">
              Messages
            </h1>
          </div>

          {loadingConversations ? (
            <p className="p-5 text-text-mid">
              Loading conversations...
            </p>
          ) : conversations.length === 0 ? (
            <p className="p-5 text-text-mid">
              No conversations yet.
            </p>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation._id}
                onClick={() => navigate(`/chat/${conversation._id}`)}
                className={`w-full text-left p-4 border-b border-warm hover:bg-cream transition-colors ${
                  conversation._id === conversationId
                    ? "bg-sage-light"
                    : ""
                }`}
              >
                <p className="font-medium text-bark-dark truncate">
                  {displayName(conversation, currentAccountId)}
                </p>

                <p className="text-sm text-text-light truncate mt-1">
                  {conversation.lastMessage || "Start the conversation"}
                </p>
              </button>
            ))
          )}

        </aside>


        {/* Chat window */}
        <div className="flex flex-col min-w-0 relative">

          {conversationId ? (
            <>
              <header className="p-5 border-b border-border-brand">
                <p className="font-medium text-bark-dark">
                  {displayName(activeConversation || {}, currentAccountId)}
                </p>
              </header>


              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-cream/50">

                {loadingMessages ? (
                  <p className="text-text-mid">
                    Loading messages...
                  </p>
                ) : messages.map((message) => {

                  const senderId =
                    message.sender?._id || message.sender;

                  const ownMessage =
                    senderId?.toString() === currentAccountId?.toString() &&
                    (!message.senderModel ||
                      message.senderModel === currentModel);

                  return (
                    <div
                      key={message._id}
                      className={`flex ${
                        ownMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                          ownMessage
                            ? "bg-rust text-white rounded-br-sm"
                            : "bg-white text-text-main border border-warm rounded-bl-sm"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  );
                })}

                <div ref={endOfMessagesRef} />

              </div>


              {/* Message input */}
              <form
                onSubmit={sendMessage}
                className="p-4 border-t border-border-brand flex gap-3"
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message..."
                  className="min-w-0 flex-1 rounded-xl border border-border-brand px-4 py-3 outline-none focus:ring-2 focus:ring-rust/30"
                />

                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="rounded-xl bg-rust px-5 text-white font-medium disabled:opacity-50"
                >
                  Send
                </button>
              </form>

            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-mid p-6 text-center">
              Choose a conversation or message an owner from a pet listing.
            </div>
          )}


          {error && (
            <p className="absolute bottom-20 right-5 max-w-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </p>
          )}

        </div>
      </section>
    </main>
  );
}
