// WizardHeader.tsx (Header for wizard view)
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface WizardHeaderProps {
  selectedMethod: string;
  onBack: () => void;
  methodLabels: Record<string, string>;
}

const WizardHeader = ({ selectedMethod, onBack, methodLabels }: WizardHeaderProps) => {
  return (
    <div className="px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="h-5 w-px bg-border" />
        <h2 className="font-semibold text-foreground">{methodLabels[selectedMethod]}</h2>
      </div>
    </div>
  );
};

export default WizardHeader;