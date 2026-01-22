// ProgressSteps.tsx (Progress steps section)
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
  steps: string[];
}

const ProgressSteps = ({ currentStep, steps }: ProgressStepsProps) => {
  return (
    <div className="flex justify-center px-6 py-4">
      <div className="flex items-center gap-4">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
                index < currentStep && "bg-primary border-primary text-primary-foreground",
                index === currentStep && "border-primary text-primary bg-primary/10",
                index > currentStep && "border-border text-muted-foreground"
              )}>
                {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
              </div>
              <span className={cn(
                "text-xs mt-2 font-medium",
                index === currentStep ? "text-primary" : "text-muted-foreground"
              )}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-12 h-0.5 mb-6",
                index < currentStep ? "bg-primary" : "bg-border"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;