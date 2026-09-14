"use client";

import { DialogContent as Content, DialogClose } from "suica-ui/dialog";
import { X } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "@/utils/cn";

export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "suica-ui/dialog";

export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-2 pr-8", className)} {...props} />
  );
}

export function DialogContent({
  closeLabel = "Close",
  className,
  children,
  ...props
}: ComponentProps<typeof Content> & { closeLabel?: string }) {
  return (
    <Content className={cn("open:grid", className)} {...props}>
      {children}
      <DialogClose
        aria-label={closeLabel}
        className="absolute top-4 right-4 size-8 min-h-0 border-0 bg-transparent p-0"
      >
        <X className="size-4" aria-hidden="true" />
      </DialogClose>
    </Content>
  );
}
