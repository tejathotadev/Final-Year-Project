import { Shield, Clock, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingApprovalPageProps {
  email: string;
  onBackToLogin: () => void;
}

const PendingApprovalPage = ({ email, onBackToLogin }: PendingApprovalPageProps) => {
  return (
    <div className="min-h-screen surface-gradient flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border/50 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 mb-6">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Request Submitted!
          </h1>
          <p className="text-muted-foreground mb-6">
            Your access request is pending admin approval
          </p>

          {/* Steps */}
          <div className="bg-muted/30 rounded-xl p-5 mb-6 text-left space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Request Received</p>
                <p className="text-xs text-muted-foreground">Your application has been submitted</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Under Review</p>
                <p className="text-xs text-muted-foreground">Admin is reviewing your request</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 opacity-50">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email Notification</p>
                <p className="text-xs text-muted-foreground">You'll be notified once approved</p>
              </div>
            </div>
          </div>

          {/* Email Info */}
          <div className="bg-primary/5 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              We'll send an update to:
            </p>
            <p className="text-sm font-medium text-foreground mt-1">{email}</p>
          </div>

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={onBackToLogin}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-left">
                This verification process ensures only authorized users
                can access the secure platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
