import React from "react";
import { motion } from "framer-motion";
import GlassTraceLine from "../components/shared/GlassTraceLine";
import NeuralNode from "../components/shared/NeuralNode";
import ModelCard from "../components/models/ModelCard";

const models = [
  {
    name: "GPT-4o",
    provider: "OpenAI",
    context: "128K",
    latency: "~800ms",
    cost: "$5 / 1M tokens",
    status: "Available",
  },
  {
    name: "Claude Sonnet",
    provider: "Anthropic",
    context: "200K",
    latency: "~600ms",
    cost: "$3 / 1M tokens",
    status: "Available",
  },
  {
    name: "Gemini Pro",
    provider: "Google",
    context: "1M",
    latency: "~400ms",
    cost: "$1.25 / 1M tokens",
    status: "Available",
  },
  {
    name: "Llama 3.1",
    provider: "Meta",
    context: "128K",
    latency: "~300ms",
    cost: "Self-hosted",
    status: "Available",
  },
  {
    name: "Mistral Large",
    provider: "Mistral AI",
    context: "32K",
    latency: "~500ms",
    cost: "$4 / 1M tokens",
    status: "Available",
  },
  {
    name: "Command R+",
    provider: "Cohere",
    context: "128K",
    latency: "~700ms",
    cost: "$3 / 1M tokens",
    status: "Available",
  },
];

export default function Models() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen pt-24 px-8"
    >
      {/* Header */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <NeuralNode active />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Model Registry
          </span>
        </div>
        <h1
          className="font-display font-bold text-foreground leading-[0.9] tracking-[-0.04em]"
          style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
        >
          Select a Brain
        </h1>
        <p className="font-body text-muted-foreground text-sm mt-4 max-w-md leading-relaxed">
          Compare architectures, latencies, and costs.
          <br />
          Hover to reveal the blueprint.
        </p>
      </div>

      <GlassTraceLine className="mb-12" />

      {/* Horizontal scroll gallery */}
      <div className="overflow-x-auto pb-12 -mx-8 px-8">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>
          {models.map((model, i) => (
            <ModelCard key={model.name} model={model} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="py-12">
        <GlassTraceLine className="mb-4" />
        <p className="font-mono text-[10px] text-muted-foreground/40 tracking-wider">
          TODO: Cursor — Add model comparison view, API key configuration, usage analytics.
        </p>
      </div>
    </motion.div>
  );
}