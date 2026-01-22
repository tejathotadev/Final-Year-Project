import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  otherUserName?: string;
}

interface MessageListProps {
  conversations: Conversation[];
  searchResults: Profile[];
  onSearch: (q: string) => void;
  onSelectConversation: (c: Conversation) => void;
  onStartConversation: (p: Profile) => void;
}

const MessageList = ({
  conversations,
  searchResults,
  onSearch,
  onSelectConversation,
  onStartConversation,
}: MessageListProps) => {
  return (
    <div className="h-full w-full sm:w-[35%] min-w-[280px] max-w-md border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {searchResults.length > 0 ? (
          searchResults.map((user) => (
            <button
              key={user.id}
              onClick={() => onStartConversation(user)}
              className="w-full p-4 text-left hover:bg-secondary/50"
            >
              <div className="font-medium">{user.full_name}</div>
            </button>
          ))
        ) : (
          <>
            {conversations.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                No conversations yet. Search to start one.
              </p>
            )}

            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={cn(
                  "w-full p-4 text-left border-b border-border/50 hover:bg-secondary/50"
                )}
              >
                <div className="font-medium">
                  {conv.otherUserName}
                </div>

                {conv.last_message && (
                  <div className="text-sm text-muted-foreground truncate">
                    {conv.last_message}
                  </div>
                )}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          {conversations.length} secure conversations
        </p>
      </div>
    </div>
  );
};

export default MessageList;
