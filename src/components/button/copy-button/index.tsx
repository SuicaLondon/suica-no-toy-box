import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

type CopyButtonProps = {
  text: string;
  className?: string;
};

export default function CopyButton({ text, className }: CopyButtonProps) {
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => handleCopy(text)}
    >
      <Copy className="h-4 w-4" />
    </Button>
  );
}
