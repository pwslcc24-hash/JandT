import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEditor } from "@/cms/context/EditorContext";

const PIN_LENGTH = 4;

export default function StudioUnlockPage() {
  const { isAdmin, unlockWithPin, setEditMode } = useEditor();
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setEditMode(true);
      navigate("/", { replace: true });
    }
  }, [isAdmin, navigate, setEditMode]);

  const tryUnlock = (code: string) => {
    const ok = unlockWithPin(code);
    if (ok) {
      setEditMode(true);
      navigate("/", { replace: true });
      return;
    }
    setError(true);
    setShaking(true);
    setPin("");
    setTimeout(() => setShaking(false), 450);
  };

  const appendDigit = (digit: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === PIN_LENGTH) tryUnlock(next);
  };

  const removeDigit = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      appendDigit(e.key);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      removeDigit();
    }
  };

  return (
    <div className="studio-unlock-page" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className={`studio-unlock-card${shaking ? " studio-unlock-card--shake" : ""}`}>
        <p className="studio-unlock-eyebrow">Private access</p>
        <h1>Site Studio</h1>
        <p className="studio-unlock-sub">
          Enter your 4-digit code to edit text, media, layout, colors, and fonts.
        </p>

        <div className="studio-pin-display" aria-label="PIN entry">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <span
              key={i}
              className={`studio-pin-dot${i < pin.length ? " studio-pin-dot--filled" : ""}${
                error ? " studio-pin-dot--error" : ""
              }`}
            />
          ))}
        </div>

        {error && <p className="studio-unlock-error">Incorrect code. Try again.</p>}

        <div className="studio-keypad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"].map((key) => {
            if (key === "clear") {
              return (
                <button
                  key={key}
                  type="button"
                  className="studio-key studio-key--muted"
                  onClick={() => {
                    setPin("");
                    setError(false);
                  }}
                >
                  Clear
                </button>
              );
            }
            if (key === "back") {
              return (
                <button
                  key={key}
                  type="button"
                  className="studio-key studio-key--muted"
                  onClick={removeDigit}
                  aria-label="Delete last digit"
                >
                  ⌫
                </button>
              );
            }
            return (
              <button
                key={key}
                type="button"
                className="studio-key"
                onClick={() => appendDigit(key)}
              >
                {key}
              </button>
            );
          })}
        </div>

        <Link to="/" className="studio-unlock-back">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
