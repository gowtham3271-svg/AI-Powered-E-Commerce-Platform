import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User as UserIcon, 
  BookOpen, 
  ExternalLink, 
  ShoppingCart,
  Layers,
  ChevronDown,
  Maximize2,
  Minimize2,
  RotateCcw
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useCart } from '../context/CartContext';
import { ReferencedProduct } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface ChatDrawerProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ onNavigate }) => {
  const { isOpen, closeChat, toggleChat, messages, loading, sendMessage, resetChat, toggleCompare } = useChat();
  const { addToCart } = useCart();
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    "Laptop under ₹60,000 for ML, coding and gaming",
    "Which phone has the best camera under ₹25,000?",
    "What is the return and replacement policy?",
    "Suggest headphones with great ANC for work",
    "Find a product with 16GB RAM and 512GB SSD"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !loading) {
      sendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleProductCardClick = (productId: number) => {
    onNavigate('product-detail', { id: productId });
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    try {
      await addToCart(productId, 1);
    } catch (err: any) {
      alert(err.message || 'Please log in to add items to your cart.');
    }
  };

  // Format inline markdown (links to #product-ID, bold, italic, inline code)
  const formatInline = (text: string): React.ReactNode[] => {
    const tokenRegex = /(\[[^\]]+\]\(#product-\d+\)|\*\*.*?\*\*|\*[^*]+\*|`[^`]+`)/g;
    const parts = text.split(tokenRegex);
    return parts.map((part, i) => {
      const linkMatch = part.match(/^\[([^\]]+)\]\(#product-(\d+)\)$/);
      if (linkMatch) {
        const label = linkMatch[1];
        const prodId = Number(linkMatch[2]);
        return (
          <button
            key={i}
            type="button"
            onClick={() => handleProductCardClick(prodId)}
            className="text-brand-400 hover:text-brand-300 underline decoration-brand-500/50 underline-offset-2 font-semibold inline-flex items-center gap-0.5 text-left"
          >
            <span>{label}</span>
            <ExternalLink size={11} className="inline shrink-0" />
          </button>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={i} className="italic text-slate-200">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return <code key={i} className="px-1 py-0.5 rounded bg-slate-800 text-brand-300 font-mono text-[11px]">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  // Format simple markdown into clean React elements
  const formatMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-white mt-2 mb-1">{formatInline(line.replace('### ', ''))}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-bold text-white mt-3 mb-1">{formatInline(line.replace('## ', ''))}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h3 key={idx} className="text-base font-bold text-white mt-2 mb-1">{formatInline(line.replace('# ', ''))}</h3>;
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-2 border-brand-500 pl-3 py-1 my-1.5 text-xs text-brand-300 bg-brand-500/10 rounded-r">
            {formatInline(line.replace('> ', ''))}
          </blockquote>
        );
      }
      const trimmed = line.trimStart();
      if (trimmed === '---' || trimmed === '***') {
        return <hr key={idx} className="border-slate-800 my-2" />;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.substring(2);
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-disc leading-relaxed my-0.5">
            {formatInline(itemText)}
          </li>
        );
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        return (
          <p key={idx} className="text-xs text-slate-200 leading-relaxed my-0.5 pl-1">
            {formatInline(trimmed)}
          </p>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1" />;
      }
      return <p key={idx} className="text-xs text-slate-300 leading-relaxed my-1">{formatInline(line)}</p>;
    });
  };

  return (
    <>
      {/* Floating Bottom-Right Assistant Launcher Trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={toggleChat}
          className="relative group p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-2xl shadow-brand-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
          aria-label="Open AI Shopping Assistant"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={22} className="animate-spin" style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline font-bold text-xs uppercase tracking-wider">
              AI Assistant
            </span>
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
          </span>
        </button>
      </div>

      {/* Slide-Up / Expandable Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 flex flex-col items-end">
          <div 
            className={`w-full sm:rounded-2xl glass border border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
              isExpanded 
                ? 'sm:w-[700px] h-full sm:h-[750px]' 
                : 'sm:w-[460px] h-full sm:h-[600px]'
            }`}
          >
            {/* Assistant Header */}
            <div className="p-3.5 px-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">BuySmart AI Assistant</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                      Live RAG
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">Grounded in Relational Catalog & Knowledge Docs</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="New conversation"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={isExpanded ? "Collapse view" : "Expand view"}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={closeChat}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  } animate-fade-in`}
                >
                  {msg.role !== 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-500/30 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={15} />
                    </div>
                  )}

                  <div className={`max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-2xl rounded-tr-sm p-3.5 px-4 shadow-md'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-2xl rounded-tl-sm p-3.5 px-4 shadow-lg'
                  }`}>
                    {/* Render message text */}
                    <div>{formatMarkdown(msg.message)}</div>

                    {/* Render Interactive Referenced Product Cards */}
                    {msg.referenced_products && msg.referenced_products.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Verified Matching Products ({msg.referenced_products.length})
                        </span>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {msg.referenced_products.map((rp) => (
                            <div
                              key={rp.id}
                              onClick={() => handleProductCardClick(rp.id)}
                              className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-brand-500/50 cursor-pointer flex items-center justify-between gap-3 group transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <ImageWithFallback
                                  src={rp.image_url}
                                  alt={rp.name}
                                  className="w-12 h-12 rounded-lg object-cover bg-slate-900 shrink-0 border border-slate-800"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-white truncate group-hover:text-brand-400 transition-colors">
                                    {rp.name}
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    {rp.brand} • <span className="font-bold text-emerald-400">₹{rp.price.toLocaleString('en-IN')}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={(e) => handleAddToCart(e, rp.id)}
                                  className="p-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-md transition-colors"
                                  title="Add to cart"
                                >
                                  <ShoppingCart size={13} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleCompare(rp.id); }}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                  title="Compare"
                                >
                                  <Layers size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources Citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                        <BookOpen size={11} className="text-brand-400 shrink-0" />
                        <span>Sources:</span>
                        {msg.sources.map((src, sIdx) => (
                          <span key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono text-[9px]">
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon size={14} />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-center gap-2.5 text-xs text-brand-400 animate-fade-in pl-1">
                  <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center shrink-0">
                    <Bot size={15} />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-slate-400 ml-1">Searching database & analyzing specs...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Chips */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40">
                <p className="text-[10px] font-semibold text-slate-400 mb-1.5">Suggested Questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.map((sp, i) => (
                    <button
                      key={i}
                      onClick={() => handlePromptClick(sp)}
                      className="px-2.5 py-1 text-[11px] rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about specs, budget, recommendations, or policies..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white shadow-md transition-all active:scale-95"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
