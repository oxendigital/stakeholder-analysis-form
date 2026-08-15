import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-lg border border-border bg-card px-3.5 text-base text-foreground transition-colors",
        "placeholder:text-muted-foreground/70",
        "focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
