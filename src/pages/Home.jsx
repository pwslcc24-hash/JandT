import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GlassTraceLine from "../components/shared/GlassTraceLine";
import NeuralNode from "../components/shared/NeuralNode";

export default function Home() {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [input]);

  // Subtle background warmth shift based on input length
  const warmth = Math.min(input.length / 200, 1);

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-1000"
      style={{
        backgroundColor: `hsl(${40 - warmth * 10}, ${7 + warmth * 3}%, ${97 - warmth * 2}%)`,
      }}
    >
      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-[0.5px] bg-foreground"
            style={{ left: `${(i + 1) * (100 / 13)}%` }}
          />
        ))}
      </div>

      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-3xl"
        >
          {/* Title cluster */}
          <div className="mb-16 space-y-4">
            <h1
              className="font-display font-bold text-foreground leading-[0.9] tracking-[-0.05em]"
              style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}
            >
              Think.
            </h1>
            <p className="font-body text-muted-foreground text-base leading-relaxed max-w-md">
              An orchestration layer for large language models.
              <br />
              Input intent. Receive intelligence.
            </p>
          </div>

          <GlassTraceLine className="mb-8" />

          {/* The Monolith Input */}
          <div className="relative group">
            <div className="flex items-center gap-3 mb-3">
              <NeuralNode active={input.length > 0} />
              <span className="font-mono text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
                Prompt
              </span>
            </div>

            <div className="relative border border-border bg-background/50 backdrop-blur-sm transition-all duration-300 group-focus-within:border-primary/30">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your intent..."
                rows={3}
                className="w-full bg-transparent px-6 py-5 font-body text-base text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none leading-[1.6]"
              />

              <div className="flex items-center justify-between px-6 py-3 border-t border-border/50">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {input.length} chars
                </span>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-body text-xs tracking-[0.1em] uppercase transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_1px_0_0_hsl(var(--foreground))]"
                  onClick={() => {
                    /* TODO: Cursor — wire up LLM call */
                  }}
                >
                  Execute
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom status bar */}
      <div className="px-8 py-6">
        <GlassTraceLine className="mb-4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <StatusItem label="Latency" value="—" />
            <StatusItem label="Tokens" value="0" />
            <StatusItem label="Model" value="None" />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
            v0.0.1 — SCAFFOLD
          </span>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
        {label}
      </span>
      <span className="font-mono text-[10px] text-foreground">
        {value}
      </span>
    </div>
  );
}