// ContentInput.tsx (Step 1: Cover and secret input)
// 4th file - FIXED VERSION

import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload } from "lucide-react";
import { useRef } from "react";

type CoverType = "text" | "image" | "audio" | "video";

interface ContentInputProps {
  selectedCover: CoverType;
  coverText: string;
  setCoverText: (text: string) => void;
  secretText: string;
  setSecretText: (text: string) => void;
  setCoverFile?: (file: File | null) => void; // optional for non-text
}

const ContentInput = ({
  selectedCover,
  coverText,
  setCoverText,
  secretText,
  setSecretText,
  setCoverFile,
}: ContentInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- HANDLE FILE CLICK ---------------- */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /* ---------------- HANDLE FILE CHANGE ---------------- */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TEXT DOCUMENT UPLOAD
    if (selectedCover === "text") {
      const text = await file.text();
      setCoverText(text);
    } else {
      // IMAGE / AUDIO / VIDEO
      setCoverFile?.(file);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6 shadow-sm">
      {/* ================= COVER CONTENT ================= */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Enter Cover Content
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          This content will look completely normal to outsiders
        </p>

        {selectedCover === "text" ? (
          <div className="space-y-4">
            {/* TEXT AREA */}
            <Textarea
              placeholder="Enter the cover text that will contain the hidden message..."
              value={coverText}
              onChange={(e) => setCoverText(e.target.value)}
              className="min-h-[100px]"
            />

            {/* OR DIVIDER */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative bg-card px-4 text-sm text-muted-foreground">
                or upload a document
              </span>
            </div>

            {/* UPLOAD CARD */}
            <div
              onClick={handleUploadClick}
              className="group border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
              </div>
              <p className="font-medium">Upload Text Document</p>
              <p className="text-xs text-muted-foreground">
                .txt, .doc, .docx, .md
              </p>
            </div>

            {/* HIDDEN FILE INPUT */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.doc,.docx,.md,.rtf"
              hidden
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <>
            {/* FILE UPLOAD CARD */}
            <div
              onClick={handleUploadClick}
              className="group border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7 text-muted-foreground group-hover:text-primary" />
              </div>
              <p className="font-medium">Upload Cover File</p>
              <p className="text-xs text-primary/70 font-mono">
                {selectedCover === "image" && ".png, .jpg, .bmp"}
                {selectedCover === "audio" && ".wav, .mp3"}
                {selectedCover === "video" && ".mp4, .mkv"}
              </p>
            </div>

            {/* HIDDEN FILE INPUT */}
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept={
                selectedCover === "image"
                  ? ".png,.jpg,.bmp"
                  : selectedCover === "audio"
                  ? ".wav,.mp3"
                  : ".mp4,.mkv"
              }
              onChange={handleFileChange}
            />
          </>
        )}
      </div>

      {/* ================= SECRET TEXT ================= */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Enter Secret Text
        </h3>
        <Textarea
          placeholder="Enter the secret text to hide..."
          value={secretText}
          onChange={(e) => setSecretText(e.target.value)}
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default ContentInput;
