// MethodSelection.tsx (Intro and method selection part)
//1st file
import { FileText, Image, Music, Video, ArrowRight, Sparkles, Shield, Eye, Sparkles as SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StegoMethod = "text" | "image" | "audio" | "video";

const methods: { id: StegoMethod; label: string; icon: React.ElementType; description: string }[] = [
  { id: "text", label: "Text Steganography", icon: FileText, description: "Hide secret text messages within various cover media types" },
  { id: "image", label: "Image Steganography", icon: Image, description: "Conceal images inside other media files invisibly" },
  { id: "audio", label: "Audio Steganography", icon: Music, description: "Embed audio files within cover media undetected" },
  { id: "video", label: "Video Steganography", icon: Video, description: "Hide video content inside other media formats" },
];

interface MethodSelectionProps {
  onSelectMethod: (method: StegoMethod) => void;
}

const MethodSelection = ({ onSelectMethod }: MethodSelectionProps) => {
  return (
    <div className="h-full flex flex-col overflow-y-auto relative">
      {/* Full Page Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        
        {/* Floating Circles - Large */}
        <div className="absolute top-[8%] left-[8%] w-20 h-20 rounded-full bg-primary/10 animate-float-slow" />
        <div className="absolute top-[15%] right-[12%] w-16 h-16 rounded-full bg-primary/8 animate-float-delayed" />
        <div className="absolute top-[35%] left-[5%] w-12 h-12 rounded-full bg-primary/6 animate-float" />
        <div className="absolute top-[25%] right-[25%] w-8 h-8 rounded-full bg-primary/10 animate-float-slow" />
        
        {/* Floating Circles - Medium */}
        <div className="absolute top-[12%] left-[30%] w-6 h-6 rounded-full bg-primary/15 animate-float" />
        <div className="absolute top-[20%] right-[8%] w-5 h-5 rounded-full bg-primary/12 animate-float-delayed" />
        <div className="absolute top-[8%] right-[40%] w-4 h-4 rounded-full bg-primary/20 animate-float-slow" />
        <div className="absolute top-[30%] left-[20%] w-5 h-5 rounded-full bg-primary/10 animate-float" />
        
        {/* Floating Circles - Small */}
        <div className="absolute top-[18%] left-[45%] w-3 h-3 rounded-full bg-primary/25 animate-float-delayed" />
        <div className="absolute top-[5%] left-[60%] w-2 h-2 rounded-full bg-primary/30 animate-float" />
        <div className="absolute top-[22%] right-[35%] w-2.5 h-2.5 rounded-full bg-primary/20 animate-float-slow" />
        <div className="absolute top-[10%] left-[75%] w-2 h-2 rounded-full bg-primary/25 animate-float" />
        
        {/* Smooth Wave at Bottom of Hero */}
        <svg 
          className="absolute top-[42%] left-0 w-full h-32"
          viewBox="0 0 1440 120" 
          preserveAspectRatio="none"
          fill="none"
        >
          <path 
            d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z" 
            fill="hsl(var(--background))"
          />
          <path 
            d="M0,65 C240,95 480,35 720,65 C960,95 1200,35 1440,65" 
            stroke="hsl(var(--primary) / 0.08)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>

      {/* Hero Section */}
      <div className="relative text-center py-16 px-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in hover:bg-primary/15 transition-colors cursor-default shadow-sm">
            <Sparkles className="w-4 h-4" />
            Secure Steganography Platform
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Stego<span className="text-primary relative">Safe
              <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
                <path d="M0,8 Q25,0 50,8 T100,8" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Hide secret messages inside text, images, audio, and video — <strong className="text-foreground">completely invisible</strong> to everyone else
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <span className="flex items-center gap-2 cursor-default">
              <span className="w-2 h-2 rounded-full bg-success" />
              256-bit Encryption
            </span>
            <span className="flex items-center gap-2 cursor-default">
              <span className="w-2 h-2 rounded-full bg-success" />
              No Data Stored
            </span>
            <span className="flex items-center gap-2 cursor-default">
              <span className="w-2 h-2 rounded-full bg-success" />
              Open Source
            </span>
          </div>
        </div>
      </div>

      {/* Method Selection */}
      <div className="relative flex-1 p-8 bg-background">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-foreground text-center mb-2">Choose Your Method</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Select the type of secret you want to <span className="text-primary">hide</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methods.map((method, index) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => onSelectMethod(method.id)}
                  className="group relative p-6 rounded-xl border border-border bg-card text-left transition-all duration-300 hover:border-primary/50 hover:shadow-elevated hover:-translate-y-1 animate-fade-in overflow-hidden"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{method.label}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all duration-300">
                      Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative py-6 border-t border-border text-center bg-background">
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-default group">
            <Shield className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            Secure
          </span>
          <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-default group">
            <Eye className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            Invisible
          </span>
          <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-default group">
            <SparklesIcon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            Simple
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2024 StegoSafe. Your secrets stay hidden.
        </p>
      </div>
    </div>
  );
};

export default MethodSelection;