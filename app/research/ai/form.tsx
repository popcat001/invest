"use client";

import { Sparkles } from "lucide-react";
import { useFormStatus } from "react-dom";
import { runAiResearchAction } from "@/app/actions";

export function AiResearchForm() {
  return (
    <form action={runAiResearchAction} className="ai-search-form">
      <label>
        Company or ticker
        <input name="query" placeholder="NVDA, Microsoft, TSMC..." required autoFocus />
      </label>
      <label>
        Engine
        <select name="provider" defaultValue="openai">
          <option value="openai">OpenAI API</option>
          <option value="codex">Codex CLI</option>
          <option value="claude">Claude Code</option>
        </select>
      </label>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="primary" type="submit" disabled={pending} aria-busy={pending}>
      <Sparkles size={16} />
      {pending ? "Researching..." : "Run research"}
    </button>
  );
}
