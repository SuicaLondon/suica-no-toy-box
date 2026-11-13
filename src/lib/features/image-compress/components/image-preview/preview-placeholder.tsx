import { ImagePlus } from "lucide-react";

type PreviewPlaceholderProps = {
  /** True while an image is being read. */
  pending: boolean;
  /** What to say before an image is picked. */
  text: string;
};

/** What the preview shows before there is an image to show. */
export function PreviewPlaceholder({ pending, text }: PreviewPlaceholderProps) {
  if (pending) {
    return (
      <div className="bg-background/80 h-full w-full" aria-hidden="true" />
    );
  }
  return (
    <div className="text-toy-muted bg-background/80 flex h-full w-full flex-col items-center justify-center gap-3">
      <ImagePlus className="size-10" strokeWidth={1} aria-hidden="true" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
