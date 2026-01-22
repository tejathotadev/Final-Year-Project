// SecretKeyInput.tsx (Step 2: Secret key input)
//5th file
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Key, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecretKeyInputProps {
  secretKey: string;
  setSecretKey: (key: string) => void;
  onAutoGenerateKey: () => void;
}

const mockContacts = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
]; // Assuming mockContacts is defined here or imported

const SecretKeyInput = ({ secretKey, setSecretKey, onAutoGenerateKey }: SecretKeyInputProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Secret Key</h3>
            <p className="text-sm text-muted-foreground">Required to decrypt the hidden message</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onAutoGenerateKey} className="gap-1.5 text-primary">
            <Sparkles className="w-4 h-4" />
            Auto-generate
          </Button>
        </div>
        <Input
          type="text"
          placeholder="Enter or generate a secret key (min 4 characters)"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
        />
      </div>

      <div className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium",
        secretKey.length >= 4
          ? "bg-success/10 text-success"
          : "bg-muted text-muted-foreground"
      )}>
        {secretKey.length >= 4 ? <CheckCircle className="w-4 h-4" /> : <Key className="w-4 h-4" />}
        {secretKey.length >= 4 ? "Ready to encrypt" : "Enter a key to continue"}
      </div>

      {/* Recipient */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Send To (Optional)</h3>
        <div className="flex flex-wrap gap-2">
          {mockContacts.map((contact) => (
            <button
              key={contact.id}
              className={cn(
                "px-3 py-1.5 rounded-full border text-sm transition-all",
                "bg-card border-border hover:border-primary/50"
              )}
            >
              {contact.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecretKeyInput;