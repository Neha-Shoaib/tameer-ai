import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-white rounded-2xl p-6 shadow-sm border border-sand-100", className)}
      {...props}
    >
      {children}
    </div>
  );
}
