import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Paperclip } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRef } from "react";

/* ---------------- TYPES ---------------- */

interface Conversation {
  id: string;
  user1: string;
  user2: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;

  // 🔐 Stego content (Send Securely)
  hidden_content?: string | null;

  // 📎 File-based stego
  file_url?: string | null;
  file_name?: string | null;

  // Metadata
  type: "text" | "file";
  stego_method?: "text" | "image" | "audio" | "video" | null;

  preview?: string | null;
  created_at: string;
}

interface MessageViewProps {
  conversation: Conversation;
  onBack: () => void;
}

/* ---------------- COMPONENT ---------------- */

const MessageView = ({ conversation, onBack }: MessageViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [decryptingMsg, setDecryptingMsg] = useState<Message | null>(null);
  const [secretKey, setSecretKey] = useState("");
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- LOAD MESSAGES ---------------- */

  const loadMessages = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    setMessages((data as Message[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`messages-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id]);

  /* ---------------- SEND TEXT MESSAGE ---------------- */

  const sendTextMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 1️⃣ Insert message
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      type: "text",
      hidden_content: newMessage,
      preview: "🔒 Encrypted message",
      stego_method: "text",
      created_by: user.id,
    });

    // 2️⃣ Update conversation preview
    await supabase
      .from("conversations")
      .update({
        last_message: "🔒 Encrypted message",
        last_message_type: "text",
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversation.id);

    setNewMessage("");
    setSending(false);
  };

  /* ---------------- FILE UPLOAD ---------------- */

  const handleFileUpload = async (file: File) => {
    setSending(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const filePath = `${conversation.id}/${Date.now()}_${file.name}`;

    // 1️⃣ Upload to storage
    const { error } = await supabase.storage
      .from("stego-files")
      .upload(filePath, file);

    if (error) {
      console.error(error);
      setSending(false);
      return;
    }

    // 2️⃣ Insert message
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      type: "file",
      file_url: filePath,
      file_name: file.name,
      preview: `📎 ${file.name}`,
      stego_method: "text",
      created_by: user.id,
    });

    // 3️⃣ Update conversation preview
    await supabase
      .from("conversations")
      .update({
        last_message: "📎 File sent",
        last_message_type: "file",
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversation.id);

    setSending(false);
  };

  useEffect(() => {
    const checkAuthorization = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (
        user &&
        conversation.user1 !== user.id &&
        conversation.user2 !== user.id
      ) {
        throw new Error("Unauthorized conversation access");
      }
    };
    checkAuthorization();
  }, [conversation.id, conversation.user1, conversation.user2]);

  const handleDecrypt = async () => {
    if (!decryptingMsg) return;

    setDecryptError(null);
    setDecryptedText(null);

    try {
      let stegoText = "";

      // 🔁 CASE 1: Securely sent (TEXT)
      if (decryptingMsg.hidden_content) {
        stegoText = decryptingMsg.hidden_content;
      }
      // 🔁 CASE 2: Uploaded file
      else if (decryptingMsg.file_url) {
        const { data } = await supabase.storage
          .from("stego-files")
          .download(decryptingMsg.file_url);

        if (!data) throw new Error("Failed to load file");
        stegoText = await data.text();
      } else {
        throw new Error("Invalid stego message");
      }

      // 🔐 Call backend decode
      const res = await fetch(
        "https://final-year-project-j4xl.onrender.com/stego/text/character-level/decode",
        {
          method: "POST",
          body: (() => {
            const fd = new FormData();
            fd.append(
              "stego_file",
              new File([stegoText], "stego.txt", { type: "text/plain" })
            );
            fd.append("secret_key", secretKey);
            return fd;
          })(),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || "Decryption failed");

      setDecryptedText(result.secret_text);
    } catch (err: any) {
      setDecryptError(err.message);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- UI ---------------- */

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-semibold">Secure Conversation</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading && (
          <p className="text-sm text-muted-foreground">Loading messages…</p>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No messages yet. Start the conversation.
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("max-w-xl p-4 rounded-xl border bg-card")}
          >
            <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              {msg.type === "file" ? "Encrypted file" : "Encrypted message"}
            </div>

            {msg.type === "text" && (
              <p className="text-sm break-words">
                {msg.hidden_content ?? "🔒 Encrypted message"}
              </p>
            )}

            {(msg.type === "file" || msg.hidden_content) && (
              <div
                className="relative group"
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div className="flex items-center gap-2 text-sm text-primary">
                  {msg.file_name ? `📎 ${msg.file_name}` : "🔐 Secure stego message"}
                </div>

                {/* 🔐 Show decrypt ONLY for stego files */}
                {hoveredMessageId === msg.id && msg.stego_method && (
                  <button
                    className="absolute top-0 right-0 text-xs bg-primary text-white px-2 py-1 rounded"
                    onClick={() => {
                      setDecryptingMsg(msg);
                      setSecretKey("");
                      setDecryptedText(null);
                    }}
                  >
                    Decrypt
                  </button>
                )}
              </div>
            )}

            <p className="text-[10px] text-muted-foreground mt-2">
              {new Date(msg.created_at).toLocaleString()}
            </p>
          </div>
        ))}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t flex items-center gap-2">
        {/* File Upload */}
        <label className="cursor-pointer">
          <input
            type="file"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          <Paperclip className="w-5 h-5 text-muted-foreground hover:text-primary" />
        </label>

        {/* Text Input */}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type encrypted message..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />

        {/* Send */}
        <button
          onClick={sendTextMessage}
          disabled={sending}
          className="px-3 py-2 rounded-lg bg-primary text-white text-sm"
        >
          Send
        </button>
      </div>

      {decryptingMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-xl w-96">
            <h3 className="font-semibold mb-3">Decrypt Message</h3>

            <input
              type="password"
              placeholder="Enter secret key"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
            />

            {decryptError && (
              <p className="text-sm text-red-600 mb-2">{decryptError}</p>
            )}

            {decryptedText && (
              <div className="bg-muted p-3 rounded text-sm mb-2">
                {decryptedText}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDecryptingMsg(null)}>
                Close
              </Button>
              <Button variant="secure" onClick={handleDecrypt}>
                Decrypt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageView;