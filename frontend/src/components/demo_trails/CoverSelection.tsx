// CoverSelection.tsx (Step 0: Cover selection)
//2nd file
// THis file is like For every Method there is a Common cover selection.tsx file.
import { FileText, Image, Music, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type CoverType = "text" | "image" | "audio" | "video";

const coverTypes: { id: CoverType; label: string; icon: React.ElementType; description: string; formats?: string }[] = [
  { id: "text", label: "Text in Text/Document", icon: FileText, description: "Hide text within text documents", formats: ".txt, .doc, .docx, .rtf, .md" },
  { id: "image", label: "Text in Image", icon: Image, description: "Hide text within an image file", formats: ".png, .jpg, .bmp" },
  { id: "audio", label: "Text in Audio", icon: Music, description: "Hide text within an audio file", formats: ".wav, .mp3, .flac" },
  { id: "video", label: "Text in Video", icon: Video, description: "Hide text within a video file", formats: ".mp4, .avi, .mkv" },
];

interface CoverSelectionProps {
  selectedCover: CoverType | null;
  onSelectCover: (cover: CoverType) => void;
}

const CoverSelection = ({ selectedCover, onSelectCover }: CoverSelectionProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-2">Choose Cover File Type</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Select the type of file you want to use as cover
      </p>

      <div className="space-y-3">
        {coverTypes.map((cover, index) => {
          const Icon = cover.icon;
          const isSelected = selectedCover === cover.id;
          return (
            <button
              key={cover.id}
              onClick={() => onSelectCover(cover.id)}
              className={cn(
                "group w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left relative overflow-hidden",
                isSelected 
                  ? "border-primary bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-md" 
                  : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
              )}
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              {/* Hover shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full group-hover:translate-x-full duration-700" />
              
              <div className={cn(
                "relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                isSelected ? "bg-primary/20 shadow-sm" : "bg-secondary group-hover:bg-primary/10"
              )}>
                <Icon className={cn("w-5 h-5 transition-colors", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground group-hover:text-primary transition-colors">{cover.label}</div>
                <div className="text-sm text-muted-foreground">{cover.description}</div>
                {cover.formats && (
                  <div className="text-xs text-primary/70 mt-1 font-mono">{cover.formats}</div>
                )}
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                isSelected ? "border-primary bg-primary" : "border-border group-hover:border-primary/50"
              )}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CoverSelection;