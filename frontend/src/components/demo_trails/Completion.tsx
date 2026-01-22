// Completion.tsx
import { Button } from "@/components/ui/button";
import { CheckCircle, Download } from "lucide-react";

interface CompletionProps {
  selectedMethod: string;
  stegoResult: string | null;
  setShowReceiverPopup: (show: boolean) => void;
  loadUsers: () => void;
}

const Completion = ({
  selectedMethod,
  stegoResult,
  setShowReceiverPopup,
  loadUsers,
}: CompletionProps) => {
  const handleDownload = () => {
    if (!stegoResult) return;

    const blob = new Blob([stegoResult], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "stego_output.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card rounded-xl border p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-success" />
      </div>

      <h3 className="text-xl font-semibold mb-2">Message Ready!</h3>

      <p className="text-muted-foreground mb-8">
        Your secret message has been successfully hidden using{" "}
        <strong>{selectedMethod}</strong> steganography.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => {
            loadUsers();
            setShowReceiverPopup(true);
          }}
        >
          Send Securely
        </Button>

        <Button variant="outline" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download File
        </Button>
      </div>
    </div>
  );
};

export default Completion;
