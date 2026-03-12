"use client";

import { useState } from "react";
import { Clipboard, Check } from "lucide-react";

const EXAMPLE_PROMPTS = [
  {
    label: "Tip Calculator",
    prompt:
      "Build me a tip calculator with a clean, friendly design. It should let me enter the bill amount, choose a tip percentage, split between people, and show the total per person.",
  },
  {
    label: "Fun Quiz",
    prompt:
      "Create a fun 10-question quiz about world geography. Give it a colorful design with a progress bar, score tracking, and a results screen at the end.",
  },
  {
    label: "Recipe Page",
    prompt:
      "Design a beautiful recipe page for chocolate chip cookies. Include an ingredients list with checkboxes, step-by-step instructions, and a timer button for the baking step.",
  },
];

export function PromptCopySection() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {EXAMPLE_PROMPTS.map((item, i) => (
        <div
          key={i}
          className="flex flex-col rounded-xl border border-border bg-card p-5"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {item.label}
          </p>
          <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
            &ldquo;{item.prompt}&rdquo;
          </p>
          <button
            onClick={() => handleCopy(item.prompt, i)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            {copiedIndex === i ? (
              <>
                <Check size={14} className="text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Clipboard size={14} />
                Copy prompt
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
