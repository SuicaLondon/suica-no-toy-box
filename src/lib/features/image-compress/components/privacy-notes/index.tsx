import type { ImageCompressMessages } from "@/i18n/image-compress-messages";
import { ShieldCheck } from "lucide-react";

/** What happens to the image, folded away under the settings. */
export function PrivacyNotes({
  messages,
}: {
  messages: ImageCompressMessages;
}) {
  return (
    <details className="border-toy-line relative border-t pt-3 text-xs">
      <summary className="text-toy-muted flex cursor-pointer items-center gap-2">
        <ShieldCheck className="size-4" aria-hidden="true" />
        {messages.privacyNotes}
      </summary>
      <div className="border-toy-line bg-background absolute inset-x-0 z-20 mt-2 grid gap-2 rounded-md border p-3 leading-relaxed shadow-lg">
        <p>{messages.privacyDetail}</p>
        <p>{messages.remoteLimits}</p>
        <p>{messages.metadataNote}</p>
      </div>
    </details>
  );
}
