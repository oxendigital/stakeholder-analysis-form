import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number;
  max?: number;
  label?: string;
}

function Progress({ className, value = 0, max = 100, label, ...props }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export { Progress };
