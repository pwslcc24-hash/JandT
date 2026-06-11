import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassTraceLine from "../shared/GlassTraceLine";

// Generative geometric SVG pattern per model
function ModelPattern({ seed }) {
  const shapes = [];
  const rng = (n) => ((seed * 9301 + 49297 + n * 233) % 233280) / 233280;

  for (let i = 0; i < 6; i++) {
    const x = 20 + rng(i * 3) * 160;
    const y = 20 + rng(i * 3 + 1) * 160;
    const size = 8 + rng(i * 3 + 2) * 40;
    shapes.push(
      <circle
        key={i}
        cx={x}
        cy={y}
        r={size}
        fill="none"
        stroke="hsl(222, 100%, 50%)"
        strokeWidth="0.5"
        opacity={0.15 + rng(i) * 0.3}
      />
    );
  }

  // Connecting lines
  for (let i = 0; i < 4; i++) {
    const x1 = rng(i * 7) * 200;
    const y1 = rng(i * 7 + 1) * 200;
    const x2 = rng(i * 7 + 2) * 200;
    const y2 = rng(i * 7 + 3) * 200;
    shapes.push(
      <line
        key={`l-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="hsl(222, 100%, 50%)"
        strokeWidth="0.3"
        opacity={0.1}
      />
    );
  }

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {shapes}
    </svg>
  );
}

export default function ModelCard({ model, index }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="flex-shrink-0 w-72 h-96 cursor-pointer"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <AnimatePresence mode="wait">
        {!flipped ? (
          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full border border-border bg-background flex flex-col"
          >
            {/* Pattern */}
            <div className="flex-1 p-4">
              <ModelPattern seed={index * 137 + 42} />
            </div>

            <GlassTraceLine />

            {/* Label */}
            <div className="px-5 py-4">
              <h3 className="font-heading text-sm font-semibold text-foreground tracking-wide">
                {model.name}
              </h3>
              <p className="font-mono text-[10px] text-muted-foreground mt-1 tracking-wider">
                {model.provider}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full border border-primary/20 bg-background flex flex-col p-5"
          >
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary mb-4">
              Blueprint
            </span>

            <h3 className="font-heading text-sm font-semibold text-foreground mb-6">
              {model.name}
            </h3>

            <div className="space-y-3 flex-1">
              <SpecRow label="Provider" value={model.provider} />
              <SpecRow label="Context" value={model.context} />
              <SpecRow label="Latency" value={model.latency} />
              <SpecRow label="Cost" value={model.cost} />
              <SpecRow label="Status" value={model.status} />
            </div>

            <GlassTraceLine className="mt-auto mb-3" />
            <p className="font-mono text-[10px] text-muted-foreground/50">
              TODO: Cursor — Add select/configure action
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
        {label}
      </span>
      <span className="font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}