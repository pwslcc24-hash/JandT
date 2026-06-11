import React from "react";
import { cn } from "@/lib/utils";

export default function GlassTraceLine({ orientation = "horizontal", className }) {
  return (
    <div
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-[0.5px] w-full" : "w-[0.5px] h-full",
        className
      )}
    />
  );
}