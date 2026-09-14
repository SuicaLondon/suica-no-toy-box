import { Button } from "suica-ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonProps {
  text: string;
  className?: string;
  ariaLabel?: string;
  successMessage?: string;
  errorMessage?: string;
}

export default function CopyButton({
  text,
  className,
  ariaLabel = "Copy text",
  successMessage = "Copied to clipboard",
  errorMessage = "Could not copy text",
}: CopyButtonProps) {
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error(errorMessage);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => handleCopy(text)}
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={!text.trim()}
    >
      <Copy className="h-4 w-4" />
    </Button>
  );
}
