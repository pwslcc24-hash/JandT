import React from "react";
import { cn } from "@/lib/utils";

export default function NeuralNode({ active = false, className }) {
  return (
    <div
      className={cn(
        "w-1 h-1 rounded-full transition-colors duration-500",
        active ? "bg-primary" : "bg-border",
        className
      )}
    />
  );
}