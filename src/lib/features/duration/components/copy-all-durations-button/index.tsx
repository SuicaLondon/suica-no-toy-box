import { Button } from "@/components/ui/button";
import { useToolI18n } from "@/i18n/tool-i18n";
import { Copy } from "lucide-react";
import { memo } from "react";
import { toast } from "sonner";
import { useDurationStore } from "../../stores/duration.store";

export const CopyAllDurationsButton = memo(function CopyAllDurationsButton() {
  const { copy } = useToolI18n();
  const copyAllWidgets = useDurationStore((state) => state.copyAllWidgets);
  const widgetCount = useDurationStore((state) => state.widgets.length);

  return (
    <Button
      type="button"
      className="border-toy-line-strong text-toy-text hover:bg-toy-hover hover:text-toy-accent min-h-10 rounded-[2px] bg-transparent font-mono text-xs tracking-[0.08em] uppercase shadow-none max-[520px]:w-full"
      onClick={handleCopy}
      disabled={widgetCount === 0}
    >
      <Copy aria-hidden="true" />
      {copy.duration.copyDates}
    </Button>
  );

  async function handleCopy() {
    try {
      const count = await copyAllWidgets();
      toast.success(copy.duration.copiedMany(count));
    } catch {
      toast.error(copy.duration.copyFailed);
    }
  }
});
