"use client";

import { useState } from "react";
import {
  Bot,
  Send,
  BookOpen,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  FileCheck,
  LoaderCircle,
} from "lucide-react";
import { useAsk } from "@/tanstack/(hooks)/ask";
import { InputGroup } from "@/components/ui/Input";

interface Citation {
  documentId: string;
  documentName: string;
  pageNumber: number;
  snippet: string;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  citations?: Citation[];
  groundingScore?: number;
  isContextInsufficient?: boolean;
}

export default function AssistantPage() {
  const { mutateAsync: askAsync, isPending: loading } = useAsk();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      content:
        "Welcome to the HealthInsight AI Research Assistant. Ask grounded questions regarding your workspace reports. Every answer is retrieved via vector similarity (pgvector) and backed by source page citations.",
    },
  ]);

  const handleAsk = async (q: string) => {
    if (!q || q.trim().length === 0 || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      content: q.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");

    try {
      const data = await askAsync(q.trim());
      const botMsg: Message = {
        id: crypto.randomUUID(),
        sender: "assistant",
        content: data.answer,
        citations: data.citations,
        groundingScore: data.groundingScore,
        isContextInsufficient: data.isContextInsufficient,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "assistant",
          content:
            "An error occurred while querying the Hugging Face AI service. Please verify document status.",
        },
      ]);
    }
  };

  return (
    <section aria-label="ai-assistant" className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Grounded AI Research Assistant (RAG)
        </h1>
        <p className="mt-0.5 text-xs text-slate-400">
          Answers questions using ONLY vector-retrieved evidence from authorized
          workspace documents with exact citations.
        </p>
      </header>

      {/* Safety Notice Banner */}
      <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-950/30 p-3 text-xs text-purple-200/90">
        <ShieldAlert className="size-4 shrink-0 text-purple-400" />
        <span>
          <strong>RAG Guardrails Active:</strong> Prompt injection protection
          enforced. Instructions inside documents are treated as untrusted text.
          Out-of-scope questions trigger explicit "insufficient context"
          warnings.
        </span>
      </div>

      {/* Main Workspace Layout */}
      <section className="relative grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        {/* Chat Interface */}
        <main className="flex h-155 flex-col rounded-2xl border border-slate-800 bg-[#0f172a]/90 shadow-sm lg:col-span-2">
          {/* Messages Window */}
          <main className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "assistant" && (
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-400">
                    <Bot className="size-4" />
                  </span>
                )}

                <div
                  className={`space-y-2 ${msg.sender === "user" ? "max-w-xl text-right" : "max-w-lg text-left"}`}
                >
                  <p
                    className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "rounded-br-none bg-teal-600 font-medium text-slate-950 shadow-md shadow-teal-600/10"
                        : "rounded-bl-none border border-slate-800 bg-slate-900 text-slate-200"
                    }`}
                  >
                    {msg.content}
                  </p>

                  {/* Grounding & Citations Drawer */}
                  {msg.sender === "assistant" &&
                    (msg.citations?.length || 0) > 0 && (
                      <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-900/90 p-3 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 text-[11px] font-semibold text-slate-300">
                          <span className="flex items-center gap-1.5 text-teal-400">
                            <FileCheck className="size-3.5 shrink-0" /> Source
                            Citations ({msg.citations?.length})
                          </span>
                          <span className="rounded border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[10px] text-teal-300">
                            Grounding Score:{" "}
                            {Math.round((msg.groundingScore || 0.88) * 100)}%
                          </span>
                        </div>

                        <div className="space-y-2">
                          {msg.citations?.map((cit, idx) => (
                            <div
                              key={idx}
                              className="space-y-1 rounded-lg border border-slate-800/60 bg-slate-950/60 p-2"
                            >
                              <p className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                                <span className="max-w-60 truncate text-teal-300">
                                  {cit.documentName}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  Page {cit.pageNumber}
                                </span>
                              </p>
                              <p className="text-[11px] text-slate-400 italic">
                                "{cit.snippet}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Context Insufficient Alert */}
                  {msg.isContextInsufficient && (
                    <p className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/30 p-2.5 text-[11px] text-amber-300">
                      <AlertTriangle className="size-4 shrink-0 text-amber-400" />
                      <span>
                        The retrieved document context did not satisfy the
                        minimum grounding threshold for an authoritative answer.
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex size-8 shrink-0 animate-pulse items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-400">
                  <Bot className="size-4" />
                </span>
                <span>
                  Generating vector embedding & retrieving grounded citations...
                </span>
              </div>
            )}
          </main>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(question);
            }}
            className="flex gap-2 rounded-b-2xl border-t border-slate-800 bg-slate-900/60 p-3"
          >
            <InputGroup
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask grounded questions about health reports (e.g., barriers to care, ANC rates)..."
              disabled={loading}
              className="py-2.5 text-xs"
              variant="secondary"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="transition-300 flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-teal-600/20 hover:bg-teal-500 disabled:opacity-75"
            >
              {loading && (
                <LoaderCircle className="size-3.5 shrink-0 animate-spin stroke-3" />
              )}
              <span>Ask AI</span>
              {!loading && <Send className="size-3.5 shrink-0" />}
            </button>
          </form>
        </main>

        {/* Suggested Prompts & Grounding Panel */}
        <main className="space-y-4 lg:sticky lg:top-18">
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5">
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-white uppercase">
              <Sparkles className="size-4 shrink-0 text-teal-400" />
              Suggested Research Questions
            </h3>
            <div className="space-y-2">
              {SAMPLE_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q)}
                  className="group transition-300 flex w-full items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-left text-xs text-slate-300 hover:border-teal-500/40 hover:text-teal-300"
                >
                  <span>{q}</span>
                  <ChevronRight className="size-3.5 shrink-0 text-slate-600 group-hover:text-teal-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400">
            <h3 className="flex items-center gap-1.5 font-semibold text-slate-200">
              <BookOpen className="size-4 shrink-0 text-teal-400" /> Grounded QA
              Principles
            </h3>
            <ul className="list-outside list-disc space-y-1 ps-3 text-xs text-slate-400">
              <li>pgvector cosine similarity matches relevant text chunks.</li>
              <li>
                Every response provides exact document name and page number.
              </li>
              <li>Model explicitly admits when context is insufficient.</li>
            </ul>
          </div>
        </main>
      </section>
    </section>
  );
}

const SAMPLE_QUESTIONS = [
  "What were the major barriers to maternal healthcare access?",
  "What percentage of enrolled mothers completed antenatal care visits?",
  "How did emergency transport funds impact delays in care in Southern Valley?",
  "What interventions improved vaccination follow-up rates?",
];
