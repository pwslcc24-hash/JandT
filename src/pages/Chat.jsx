import React, { useState } from "react";
import { motion } from "framer-motion";
import ContextRail from "../components/chat/ContextRail";
import MessageBlock from "../components/chat/MessageBlock";
import ChatInput from "../components/chat/ChatInput";

const sampleMessages = [
  {
    role: "system",
    content: "You are a helpful assistant. You respond concisely and accurately.",
    timestamp: "00:00:00",
  },
  {
    role: "user",
    content: "Explain the transformer architecture in three sentences.",
    timestamp: "00:00:12",
  },
  {
    role: "assistant",
    content:
      "The Transformer architecture processes input sequences in parallel using self-attention mechanisms, allowing each token to attend to every other token simultaneously. It consists of an encoder-decoder structure with multi-head attention layers, feed-forward networks, and residual connections. This design eliminated the sequential bottleneck of RNNs and became the foundation for modern large language models.",
    timestamp: "00:00:14",
  },
];

export default function Chat() {
  const [messages, setMessages] = useState(sampleMessages);

  const handleSend = (content) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content, timestamp: new Date().toLocaleTimeString() },
    ]);
    // TODO: Cursor — wire up actual LLM call, stream response
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="h-screen pt-16 flex"
    >
      {/* Context Rail — 30% */}
      <div className="hidden lg:block w-[30%] min-w-[280px] max-w-[360px]">
        <ContextRail />
      </div>

      {/* Chat Stream — 70% */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 lg:px-16 py-8">
          <div className="max-w-2xl ml-12">
            {messages.map((msg, i) => (
              <MessageBlock
                key={i}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
              />
            ))}
          </div>
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} />
      </div>
    </motion.div>
  );
}