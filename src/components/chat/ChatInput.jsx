import React, { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ChatInput({ onSend }) {
  const [value, setValue] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSend?.(value.trim());
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border px-8 py-4 bg-background">
      <div className="flex items-end gap-3">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Continue the conversation..."
          rows={1}
          className="flex-1 bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none leading-[1.6] py-2"
        />
        <button
          onClick={handleSubmit}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-foreground text-background transition-all duration-200 hover:translate-y-[-1px]"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}