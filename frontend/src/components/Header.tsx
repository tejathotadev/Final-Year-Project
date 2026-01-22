import { Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onLogout: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  return (
    <header className="h-16 border-b border-border bg-card backdrop-blur-md sticky top-0 left-0 right-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Stego<span className="text-primary">Safe</span>
          </span>
        </div>

        {/* Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="text-sm font-medium text-success">Secure Session</span>
        </div>

        {/* Mobile Status */}
        <div className="flex md:hidden items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="text-xs font-medium text-success">Secure</span>
        </div>

        {/* Logout Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onLogout} 
          className="gap-2 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
