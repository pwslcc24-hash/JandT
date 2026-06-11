import React, { useState } from "react";
import { Copy, Pencil } from "lucide-react";
import GlassTraceLine from "../shared/GlassTraceLine";

export default function MessageBlock({ role, content, timestamp }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Role label */}
      <div className="flex items-center gap-3 mb-2">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          {role}
        </span>
        {timestamp && (
          <span className="font-mono text-[10px] text-muted-foreground/40">
            {timestamp}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="relative">
        <p className="font-body text-base text-foreground leading-[1.6] whitespace-pre-wrap">
          {content}
        </p>

        {/* Peripheral utility bar */}
        {hovered && (
          <div className="absolute -left-12 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <Copy className="w-3 h-3" />
            </button>
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <GlassTraceLine className="mt-6 mb-6" />
    </div>
  );
}