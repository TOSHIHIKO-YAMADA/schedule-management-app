import { AlertCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ApiErrorAlertProps {
  error: Error | null;
  onRetry?: () => void;
  className?: string;
}

export function ApiErrorAlert({ error, onRetry, className }: ApiErrorAlertProps) {
  if (!error) return null;

  const errorMessage = error.message || "予期しないエラーが発生しました";

  return (
    <Alert variant="destructive" className={className}>
      <XCircle className="h-4 w-4" />
      <AlertTitle>エラー</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{errorMessage}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            再試行
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}