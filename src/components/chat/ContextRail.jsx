import React from "react";
import GlassTraceLine from "../shared/GlassTraceLine";
import NeuralNode from "../shared/NeuralNode";

const placeholderVariables = [
  { key: "system_prompt", value: "You are a helpful assistant." },
  { key: "temperature", value: "0.7" },
  { key: "max_tokens", value: "4096" },
  { key: "model", value: "—" },
];

export default function ContextRail() {
  return (
    <div className="h-full flex flex-col border-r border-border bg-background/50">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <NeuralNode active />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Context
          </span>
        </div>
      </div>

      {/* Variables */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {placeholderVariables.map((v) => (
          <div key={v.key}>
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
              {v.key}
            </span>
            <p className="font-mono text-xs text-foreground leading-relaxed">
              {v.value}
            </p>
            <GlassTraceLine className="mt-3" />
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-6 py-4 border-t border-border">
        <p className="font-mono text-[10px] text-muted-foreground/50 leading-relaxed">
          TODO: Cursor — Add editable system prompt, temperature slider, model selector.
        </p>
      </div>
    </div>
  );
}