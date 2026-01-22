import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MessageList from "../components/MessageList";
import MessageView from "../components/MessageView";
import Header from "../components/Header";
import StegoWorkspace from "../components/demo_trails/StegoWorkspace";
import { useNavigate } from "react-router-dom";

/* ---------------- TYPES ---------------- */

interface Profile {
  id: string;
  full_name: string;
}

interface Conversation {
  id: string;
  user1: string;
  user2: string;
  last_message: string | null;
  updated_at: string;
  otherUserId?: string;
  otherUserName?: string;
}

/* ---------------- COMPONENT ---------------- */

const WorkspacePage = () => {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

const [pendingSend, setPendingSend] = useState<{
  conversationId: string;
  content: string;
  method: string;
} | null>(null);


  /* ---------------- AUTH ---------------- */

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  /* ---------------- SEND FROM STEGO WORKSPACE ---------------- */

  useEffect(() => {
  if (!pendingSend) return;

  const sendMessage = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("messages").insert({
      conversation_id: pendingSend.conversationId,
      sender_id: user.id,
      type: "file",
      hidden_content: pendingSend.content,
      preview: "🔐 Stego message",
      stego_method: pendingSend.method,
      created_by: user.id,
    });

    await supabase
      .from("conversations")
      .update({
        last_message: "🔒 Encrypted message",
        last_message_type: "text",
        updated_at: new Date().toISOString(),
      })
      .eq("id", pendingSend.conversationId);

    setPendingSend(null);
  };

  sendMessage();
}, [pendingSend]);

  /* ---------------- LOAD CONVERSATIONS ---------------- */

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .or(`user1.eq.${user.id},user2.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (!convs || convs.length === 0) {
      setConversations([]);
      return;
    }

    const otherUserIds = convs.map((c) =>
      c.user1 === user.id ? c.user2 : c.user1
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", otherUserIds);

    const profileMap = new Map(
      profiles?.map((p) => [p.id, p.full_name])
    );

    const enriched = convs.map((c) => {
      const otherUserId =
        c.user1 === user.id ? c.user2 : c.user1;

      return {
        ...c,
        otherUserId,
        otherUserName: profileMap.get(otherUserId) || "Unknown User",
      };
    });

    setConversations(enriched);
  };

  /* ---------------- SEARCH USERS ---------------- */

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .ilike("full_name", `%${query}%`)
      .neq("id", user.id);

    setSearchResults(data || []);
  };

  /* ---------------- START CONVERSATION ---------------- */

  const startConversation = async (profile: Profile) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `and(user1.eq.${user.id},user2.eq.${profile.id}),and(user1.eq.${profile.id},user2.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) {
      setSelectedConversation({
        ...existing,
        otherUserId: profile.id,
        otherUserName: profile.full_name,
      });
      setSearchResults([]);
      return;
    }

    const { data: created } = await supabase
      .from("conversations")
      .insert({
        user1: user.id,
        user2: profile.id,
        last_message: null,
      })
      .select()
      .single();

    if (created) {
      setConversations((prev) => [
        {
          ...created,
          otherUserId: profile.id,
          otherUserName: profile.full_name,
        },
        ...prev,
      ]);

      setSelectedConversation({
        ...created,
        otherUserId: profile.id,
        otherUserName: profile.full_name,
      });

      setSearchResults([]);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLogout={handleLogout} />

      <div className="flex flex-1 overflow-hidden">
        <MessageList
          conversations={conversations}
          searchResults={searchResults}
          onSearch={searchUsers}
          onSelectConversation={setSelectedConversation}
          onStartConversation={startConversation}
        />

        {/* 🔥 IMPORTANT FIX: DO NOT UNMOUNT MessageView */}
        <div className="flex-1 bg-background overflow-hidden relative">
          <div
            className={`absolute inset-0 ${
              selectedConversation ? "block" : "hidden"
            }`}
          >
            {selectedConversation && (
              <MessageView
                conversation={selectedConversation}
                onBack={() => setSelectedConversation(null)}
              />
            )}
          </div>

          <div
            className={`absolute inset-0 ${
              !selectedConversation ? "block" : "hidden"
            }`}
          >
            <StegoWorkspace
  onSendToChat={(data) => {
    if (!selectedConversation) return;
    setPendingSend({
      conversationId: selectedConversation.id,
      content: data.content,
      method: data.method,
    });
  }}
/>

          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
