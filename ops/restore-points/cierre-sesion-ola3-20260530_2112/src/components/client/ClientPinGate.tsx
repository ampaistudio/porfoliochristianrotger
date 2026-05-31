import React, { useState, useRef } from "react";
import { verifyClientSession, ClientSession } from "../../utils/supabase";

interface Props {
  sessionId: string;
  onUnlocked: (session: ClientSession) => void;
}

export default function ClientPinGate({ sessionId, onUnlocked }: Props) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigit = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...pin];
    next[index] = value;
    setPin(next);
    if (value && index < 3) inputs.current[index + 1]?.focus();
    if (next.every((d) => d !== "")) {
      handleSubmit(next.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (fullPin: string) => {
    setError("");
    setLoading(true);
    const { session, error: err } = await verifyClientSession(sessionId, fullPin);
    setLoading(false);
    if (err || !session) {
      setError(err ?? "PIN incorrecto.");
      setPin(["", "", "", ""]);
      inputs.current[0]?.focus();
    } else {
      onUnlocked(session);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-8">

        <div className="space-y-2">
          <div className="text-3xl mb-4">🔒</div>
          <h1 className="text-white font-serif text-2xl font-semibold">
            Portafolio Privado
          </h1>
          <p className="text-stone-400 text-sm leading-relaxed">
            Ingresá el PIN de 4 dígitos que recibiste para acceder a tu selección de fotos.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className="w-14 h-14 text-center text-2xl font-mono font-bold text-white bg-stone-900 border-2 border-stone-700 rounded-xl focus:border-white focus:outline-none transition-colors disabled:opacity-50"
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm font-mono">{error}</p>
        )}

        {loading && (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-stone-600 border-t-white rounded-full animate-spin" />
          </div>
        )}

        <p className="text-stone-600 text-[10px] font-mono">
          Powered by Nodo Ai Agency · www.nodoai.co
        </p>
      </div>
    </div>
  );
}
