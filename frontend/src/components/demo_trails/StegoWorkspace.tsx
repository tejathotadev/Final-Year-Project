import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MethodSelection from "./MethodSelection";
import WizardHeader from "./WizardHeader";
import ProgressSteps from "./ProgressSteps";
import CoverSelection from "./CoverSelection";
import ContentInput from "./ContentInput";
import SecretKeyInput from "./SecretKeyInput";
import Completion from "./Completion";
import { supabase } from "@/lib/supabaseClient";

/* ================= TYPES ================= */

type StegoMethod = "text" | "image" | "audio" | "video";
type CoverType = "text" | "image" | "audio" | "video";
type TextStegoAlgo = "character" | "homoglyph" | "word";

interface StegoWorkspaceProps {
  onSendToChat: (data: { content: string; method: StegoMethod }) => void;
}
interface Props {
  onSendSecure: (receiver: any) => void;
}

/* ================= CONFIG ================= */

const BACKEND_URL = "http://localhost:8000";

const TEXT_STEGO_ENDPOINTS = {
  character: "/stego/text/character-level/encode",
  homoglyph: "/stego/text/homoglyph/encode",
  word: "/stego/text/word-level/encode",
};

const steps = ["Cover Media", "Secret Text", "Secret Key", "Complete"];

const methodLabels = {
  text: "Text Steganography",
  image: "Image Steganography",
  audio: "Audio Steganography",
  video: "Video Steganography",
};

/* ================= COMPONENT ================= */

const StegoWorkspace = ({ onSendToChat }: StegoWorkspaceProps) => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<StegoMethod | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [selectedCover, setSelectedCover] = useState<CoverType | null>(null);
  const [textAlgo, setTextAlgo] = useState<TextStegoAlgo>("character");

  const [coverText, setCoverText] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverInputMode, setCoverInputMode] =
    useState<"text" | "file">("text");

  const [secretText, setSecretText] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const [stegoResult, setStegoResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showReceiverPopup, setShowReceiverPopup] = useState(false);
const [users, setUsers] = useState<any[]>([]);
const [selectedUser, setSelectedUser] = useState<any>(null);

const loadUsers = async () => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .neq("id", auth.user.id);

  setUsers(data || []);
};


  /* ================= RESET ================= */

  const resetWorkspace = () => {
    setCurrentStep(0);
    setSelectedCover(null);
    setCoverText("");
    setCoverFile(null);
    setCoverInputMode("text");
    setSecretText("");
    setSecretKey("");
    setStegoResult(null);
    setErrorMessage(null);
    setIsProcessing(false);
    setTextAlgo("character");
  };

  /* ================= SEND SECURELY ================= */

  const handleSendSecure = async (receiver: any) => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  // 1️⃣ Find or create conversation
  let { data: convo } = await supabase
    .from("conversations")
    .select("*")
    .or(
      `and(user1.eq.${auth.user.id},user2.eq.${receiver.id}),and(user1.eq.${receiver.id},user2.eq.${auth.user.id})`
    )
    .single();

  if (!convo) {
    const { data: newConvo } = await supabase
      .from("conversations")
      .insert({
        user1: auth.user.id,
        user2: receiver.id,
        last_message: "🔐 Encrypted file",
        last_message_type: "file",
      })
      .select()
      .single();

    convo = newConvo;
  }

  // 2️⃣ Insert message (NO UPLOAD)
await supabase.from("messages").insert({
  conversation_id: convo.id,
  sender_id: auth.user.id,
  type: "file",                    // whatever you're using
  hidden_content: stegoResult,          // ← fixed
  preview: "🔒 Encrypted message",
  stego_method: selectedMethod,
  created_by: auth.user.id,
});

};

  /* ================= HELPERS ================= */

  const convertTextToFile = (text: string): File => {
    return new File([text], "cover.txt", { type: "text/plain" });
  };

  /* ================= BACKEND CALL ================= */

  const handleEncodeTextStego = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const finalCoverFile =
        coverInputMode === "file" && coverFile
          ? coverFile
          : convertTextToFile(coverText);

      const formData = new FormData();
      formData.append("cover_file", finalCoverFile);
      formData.append("secret_text", secretText);
      formData.append("secret_key", secretKey);

      const endpoint = TEXT_STEGO_ENDPOINTS[textAlgo];

      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        body: formData,
      });

            if (!res.ok) {
        throw new Error("Encoding failed");
      }

      // 🔐 BACKEND RETURNS TEXT FILE NOW
      const stegoText = await res.text();
      setStegoResult(stegoText);

    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  /* ================= NAVIGATION ================= */

  const handleMethodSelect = (method: StegoMethod) => {
    resetWorkspace();
    setSelectedMethod(method);
  };

  const handleContinue = async () => {
    if (currentStep === 2 && selectedMethod === "text") {
      await handleEncodeTextStego();
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === steps.length - 1) {
      resetWorkspace();
      setSelectedMethod(null);
      return;
    }

    if (currentStep === 0) {
      resetWorkspace();
      setSelectedMethod(null);
    } else {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleAutoGenerateKey = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "";
    for (let i = 0; i < 16; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSecretKey(key);
  };

  const canContinue = () => {
    switch (currentStep) {
      case 0:
        return selectedCover !== null;
      case 1:
        return (
          secretText.length > 0 &&
          (coverText.length > 0 || coverFile !== null)
        );
      case 2:
        return secretKey.length >= 4;
      default:
        return true;
    }
  };

  /* ================= UI ================= */

  if (!selectedMethod) {
    return <MethodSelection onSelectMethod={handleMethodSelect} />;
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto">
      <WizardHeader
        selectedMethod={selectedMethod}
        onBack={handleBack}
        methodLabels={methodLabels}
      />

      <ProgressSteps currentStep={currentStep} steps={steps} />

      <div className="flex-1 p-6 flex items-start justify-center">
        <div className="w-full max-w-xl">
          {currentStep === 0 && (
            <CoverSelection
              selectedCover={selectedCover}
              onSelectCover={setSelectedCover}
            />
          )}

          {currentStep === 1 && selectedCover && (
            <>
              {selectedMethod === "text" && (
                <div className="mb-4">
                  <label className="text-sm font-medium">
                    Text Steganography Type
                  </label>
                  <select
                    value={textAlgo}
                    onChange={(e) =>
                      setTextAlgo(e.target.value as TextStegoAlgo)
                    }
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  >
                    <option value="character">Character Level</option>
                    <option value="homoglyph">Homoglyph Level</option>
                    <option value="word">Word Level</option>
                  </select>
                </div>
              )}

              <ContentInput
                selectedCover={selectedCover}
                coverText={coverText}
                setCoverText={(t) => {
                  setCoverText(t);
                  setCoverInputMode("text");
                  setCoverFile(null);
                }}
                secretText={secretText}
                setSecretText={setSecretText}
              />
            </>
          )}

          {currentStep === 2 && (
            <SecretKeyInput
              secretKey={secretKey}
              setSecretKey={setSecretKey}
              onAutoGenerateKey={handleAutoGenerateKey}
            />
          )}

          {currentStep === 3 && selectedMethod && (
            <Completion
              selectedMethod={selectedMethod}
              stegoResult={stegoResult}
              setShowReceiverPopup={setShowReceiverPopup}
              loadUsers={loadUsers}
            />
          )}

          {errorMessage && (
            <p className="text-sm text-red-600 text-center mt-4">
              {errorMessage}
            </p>
          )}

          {isProcessing && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Processing steganography...
            </p>
          )}
        </div>
      </div>
{showReceiverPopup && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-card p-6 rounded-xl w-96">
      <h3 className="font-semibold mb-4">Select Receiver</h3>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            className={`p-2 rounded cursor-pointer border ${
              selectedUser?.id === u.id
                ? "bg-primary text-white"
                : "hover:bg-muted"
            }`}
          >
            {u.full_name}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => setShowReceiverPopup(false)}>
          Cancel
        </Button>
        <Button
  disabled={!selectedUser}
  onClick={async () => {
    await handleSendSecure(selectedUser);
    setShowReceiverPopup(false);
    resetWorkspace();
    setSelectedMethod(null);
  }}
>
  Send
</Button>

      </div>
    </div>
  </div>
)}

      {currentStep < 3 && (
        <div className="p-6 border-t border-border bg-card">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="secure"
              onClick={handleContinue}
              disabled={!canContinue()}
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StegoWorkspace;
