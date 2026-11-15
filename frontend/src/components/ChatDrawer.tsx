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
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Check
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useCart } from '../context/CartContext';
import { ReferencedProduct } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { SEED_PRODUCTS } from '../data/seedCatalog';

interface ChatDrawerProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ onNavigate }) => {
  const { isOpen, closeChat, toggleChat, messages, loading, sendMessage, resetChat, toggleCompare } = useChat();
  const { addToCart } = useCart();
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    "Laptop under ₹60,000 for ML, coding and gaming",
    "Which phone has the best camera under ₹25,000?",
    "What is the 7-day return and replacement policy?",
    "Suggest headphones with great ANC for work",
    "How does express delivery and shipping work?"
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

  const handleProductCardClick = (productId: number | string) => {
    const numId = Number(productId);
    const targetId = isNaN(numId) ? productId : numId;
    onNavigate('product-detail', { id: targetId });
    if (window.innerWidth < 768) {
      closeChat();
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    try {
      await addToCart(productId, 1);
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 1800);
    } catch (err: any) {
      alert(err.message || 'Please log in to add items to your cart.');
    }
  };

  // Format inline markdown (links to products, bold, italic, code)
  const formatInline = (text: string): React.ReactNode[] => {
    const tokenRegex = /(\[[^\]]+\]\([^\)]+\)|\*\*.*?\*\*|\*[^*]+\*|`[^`]+`)/g;
    const parts = text.split(tokenRegex);
    return parts.map((part, i) => {
      // Check for product link in markdown like [Display Name](#product-2) or [Display Name](/product/2)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
      if (linkMatch) {
        const label = linkMatch[1];
        const href = linkMatch[2];
        const idMatch = href.match(/(?:#product-?|#product\/|\/product\/|#)(\d+)/i);
        let prodId = idMatch ? Number(idMatch[1]) : null;

        if (!prodId) {
          const matchByName = SEED_PRODUCTS.find(p => 
            p.name.toLowerCase().includes(label.toLowerCase()) || 
            label.toLowerCase().includes(p.name.toLowerCase())
          );
          if (matchByName) prodId = matchByName.id;
        }

        if (prodId) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleProductCardClick(prodId!)}
              className="text-white underline decoration-neutral-500 hover:decoration-white underline-offset-2 font-bold inline-flex items-center gap-0.5 text-left transition-colors"
            >
              <span>{label}</span>
              <ExternalLink size={11} className="inline shrink-0 opacity-70" />
            </button>
          );
        }
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={i} className="italic text-neutral-300">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 font-mono text-[11px] border border-neutral-700">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  // Format simple markdown into clean React elements
  const formatMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-black text-white mt-3 mb-1.5 uppercase tracking-wide">{formatInline(line.replace('### ', ''))}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-black text-white mt-3 mb-1.5 uppercase">{formatInline(line.replace('## ', ''))}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h3 key={idx} className="text-base font-black text-white mt-2 mb-1 uppercase">{formatInline(line.replace('# ', ''))}</h3>;
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-2 border-white pl-3 py-1 my-2 text-xs text-neutral-300 bg-neutral-900/60 rounded-r">
            {formatInline(line.replace('> ', ''))}
          </blockquote>
        );
      }
      const trimmed = line.trimStart();
      if (trimmed === '---' || trimmed === '***') {
        return <hr key={idx} className="border-neutral-800 my-2.5" />;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.substring(2);
        return (
          <li key={idx} className="text-xs text-neutral-300 ml-4 list-disc leading-relaxed my-0.5">
            {formatInline(itemText)}
          </li>
        );
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        return (
          <p key={idx} className="text-xs text-neutral-200 leading-relaxed my-0.5 pl-1">
            {formatInline(trimmed)}
          </p>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return <p key={idx} className="text-xs text-neutral-300 leading-relaxed my-1">{formatInline(line)}</p>;
    });
  };

  return (
    <>
      {/* Floating Bottom-Right Assistant Launcher Trigger (Snitch Sleek Black Theme) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={toggleChat}
          className="relative group p-3.5 sm:p-4 rounded-2xl bg-neutral-900/95 hover:bg-neutral-800 text-white shadow-2xl shadow-black/80 hover:scale-105 active:scale-95 transition-all duration-200 border border-neutral-700/80 backdrop-blur-md flex items-center gap-2"
          aria-label="Open AI Shopping Assistant"
        >
          <Sparkles size={20} className="animate-spin text-white" style={{ animationDuration: '6s' }} />
          <span className="hidden sm:inline font-black text-xs uppercase tracking-[0.15em]">
            AI ASSISTANT
          </span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </button>
      </div>

      {/* Slide-Up / Expandable Chat Modal (Snitch Monochrome Aesthetic) */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 flex flex-col items-end animate-fade-in">
          <div 
            className={`w-full sm:rounded-2xl bg-neutral-950 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
              isExpanded 
                ? 'sm:w-[700px] h-full sm:h-[750px]' 
                : 'sm:w-[460px] h-full sm:h-[620px]'
            }`}
          >
            {/* Assistant Header */}
            <div className="p-3.5 px-4 bg-black border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">BUYSMART AI ASSISTANT</h3>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono font-bold uppercase">
                      LIVE RAG
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">Grounded in Relational Catalog & Knowledge Docs</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                  title="New conversation"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden sm:inline-flex p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                  title={isExpanded ? "Collapse view" : "Expand view"}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={closeChat}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  } animate-fade-in`}
                >
                  {msg.role !== 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={15} />
                    </div>
                  )}

                  <div className={`max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-white text-black font-medium rounded-2xl rounded-tr-sm p-3.5 px-4 shadow-md'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-2xl rounded-tl-sm p-3.5 px-4 shadow-lg'
                  }`}>
                    {/* Render message text */}
                    <div>{formatMarkdown(msg.message)}</div>

                    {/* Render Interactive Referenced Product Cards */}
                    {msg.referenced_products && msg.referenced_products.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                          Verified Matching Products ({msg.referenced_products.length})
                        </span>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {msg.referenced_products.map((rp) => (
                            <div
                              key={rp.id}
                              onClick={() => handleProductCardClick(rp.id)}
                              className="p-2.5 rounded-xl bg-black border border-neutral-800 hover:border-neutral-600 cursor-pointer flex items-center justify-between gap-3 group transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <ImageWithFallback
                                  src={rp.image_url}
                                  alt={rp.name}
                                  className="w-12 h-14 rounded-lg object-cover bg-neutral-900 shrink-0 border border-neutral-800 group-hover:scale-105 transition-transform"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate group-hover:text-neutral-200 transition-colors">
                                    {rp.name}
                                  </p>
                                  <p className="text-[11px] text-neutral-400">
                                    {rp.brand} • <span className="font-black text-white">₹{rp.price.toLocaleString('en-IN')}</span>
                                  </p>
                                  <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400 group-hover:text-white uppercase font-bold tracking-wider mt-0.5">
                                    View Details <ChevronRight size={10} />
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={(e) => handleAddToCart(e, rp.id)}
                                  className={`p-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                                    addedId === rp.id
                                      ? 'bg-emerald-500 text-black'
                                      : 'bg-white text-black hover:bg-neutral-200'
                                  }`}
                                  title="Add to bag"
                                >
                                  {addedId === rp.id ? <Check size={13} /> : <ShoppingCart size={13} />}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleCompare(rp.id); }}
                                  className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
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
                      <div className="mt-2.5 pt-2 border-t border-neutral-800 flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-400">
                        <BookOpen size={11} className="text-neutral-400 shrink-0" />
                        <span>Sources:</span>
                        {msg.sources.map((src, sIdx) => (
                          <span key={sIdx} className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[9px] border border-neutral-700">
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon size={14} />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-center gap-2.5 text-xs text-white animate-fade-in pl-1">
                  <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                    <Bot size={15} />
                  </div>
                  <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-neutral-400 ml-1 text-xs">Searching database & analyzing specs...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Chips */}
            {messages.length <= 2 && (
              <div className="px-4 py-2.5 border-t border-neutral-800 bg-black">
                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Suggested Questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.map((sp, i) => (
                    <button
                      key={i}
                      onClick={() => handlePromptClick(sp)}
                      className="px-2.5 py-1 text-[11px] rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-800 bg-black flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about specs, budget, recommendations, or policies..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="p-2.5 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-30 text-black shadow-md transition-all active:scale-95"
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