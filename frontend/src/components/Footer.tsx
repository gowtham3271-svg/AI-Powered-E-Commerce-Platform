import React from 'react';
import { Sparkles, Database, Cpu, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Sparkles size={18} />
              </div>
              <span className="text-base font-bold text-white">BuySmart</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              AI-Powered E-Commerce Assistant powered by FastAPI, LangChain, RAG, and normalized PostgreSQL DBMS architecture.
            </p>
          </div>

          {/* DBMS Architecture Highlights */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold flex items-center gap-1.5">
              <Database size={15} className="text-brand-400" />
              DBMS Architecture
            </h4>
            <ul className="space-y-1 text-slate-400">
              <li>• 13-Table Relational Schema (3NF)</li>
              <li>• ACID Transactions & Row Locks</li>
              <li>• MySQL Workbench & Postgres DDL</li>
              <li>• Composite B-Tree & Vector Indexes</li>
            </ul>
          </div>

          {/* AI & RAG Engine */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold flex items-center gap-1.5">
              <Cpu size={15} className="text-indigo-400" />
              AI & RAG Pipeline
            </h4>
            <ul className="space-y-1 text-slate-400">
              <li>• LangChain Text Splitters</li>
              <li>• Sentence-Transformers (384-d)</li>
              <li>• Google Gemini Generative LLM</li>
              <li>• Live Inventory Grounding (Zero Hallucination)</li>
            </ul>
          </div>

          {/* Academic & Policies */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-emerald-400" />
              Policies & Compliance
            </h4>
            <ul className="space-y-1 text-slate-400">
              <li>• 7-Day Replacement Policy</li>
              <li>• 100% Genuine Brand Warranty</li>
              <li>• Fast Express Shipping</li>
              <li>• College DBMS Project Submission</li>
            </ul>
          </div>

        </div>

        <div className="mt-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 BuySmart AI. Academic DBMS & AI Full-Stack Project.</p>
          <div className="flex gap-4">
            <span>FastAPI + SQLAlchemy 2.x</span>
            <span>•</span>
            <span>React 18 + Vite + Tailwind</span>
            <span>•</span>
            <span>PostgreSQL + pgvector</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
