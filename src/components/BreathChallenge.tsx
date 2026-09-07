"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function levelFor(seconds: number) {
  if (seconds >= 60) return "Warrior Calm";
  if (seconds >= 45) return "Strong Recovery";
  if (seconds >= 30) return "Healthy Base";
  if (seconds >= 15) return "Building Control";
  return "Ready";
}

export function BreathChallenge() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const display = useMemo(() => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }, [seconds]);

  return (
    <div className="rounded-md border border-[#d4a017]/30 bg-[#21170e] p-5 text-white shadow-2xl shadow-black/20">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d4a017]">Interactive Test</p>
          <h3 className="mt-2 text-2xl font-semibold">Kumbhaka Challenge</h3>
          <p className="mt-2 text-sm leading-6 text-white/70">
            A simple breath-retention timer inspired by traditional training focus.
          </p>
        </div>
        <div className="rounded-md bg-white/8 px-3 py-2 text-right">
          <p className="text-xs text-white/50">Level</p>
          <p className="text-sm font-semibold text-[#d4a017]">{levelFor(seconds)}</p>
        </div>
      </div>

      <div className="my-8 text-center">
        <div className="font-mono text-6xl font-semibold tracking-tight text-white">{display}</div>
        <div className="mt-4 flex justify-center gap-2 text-xs font-semibold text-white/45">
          {[15, 30, 45, 60].map((mark) => (
            <span key={mark} className={seconds >= mark ? "text-[#d4a017]" : ""}>
              {mark}s
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRunning((value) => !value)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#d4a017] px-4 text-sm font-bold text-[#1b1208]"
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setSeconds(0);
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 px-4 text-sm font-bold text-white"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
}
