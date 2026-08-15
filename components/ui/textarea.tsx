import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-base leading-relaxed text-foreground transition-colors",
        "placeholder:text-muted-foreground/70",
        "focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
