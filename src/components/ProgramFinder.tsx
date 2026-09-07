"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

const options = [
  {
    id: "foundation",
    label: "Foundation",
    title: "Start with movement fundamentals",
    text: "Build safe technique, rhythm, posture, and confidence before progressing into longer flows.",
  },
  {
    id: "advanced",
    label: "Advanced",
    title: "Progress into stronger flow work",
    text: "Layer transitions, conditioning, complexity, and performance quality once the base is steady.",
  },
  {
    id: "workshops",
    label: "Workshops",
    title: "Register for upcoming sessions",
    text: "Use the Google Form to share interest and receive details for upcoming workshop batches.",
  },
];

export function ProgramFinder() {
  const [selected, setSelected] = useState(options[0]);

  return (
    <div className="rounded-md border border-[#e5e7eb] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f766e]">Find Your Track</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            onClick={() => setSelected(option)}
            className={`h-10 rounded-md text-sm font-semibold transition ${
              selected.id === option.id
                ? "bg-[#0f766e] text-white"
                : "bg-[#f3f4f6] text-[#111827] hover:bg-[#e5e7eb]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-md bg-[#f9fafb] p-5">
        <h3 className="text-xl font-semibold text-[#111827]">{selected.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#4b5563]">{selected.text}</p>
        <a
          href="#programs"
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#0f766e]"
        >
          View programs <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
