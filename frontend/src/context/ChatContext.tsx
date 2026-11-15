import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatMessage } from '../types';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

interface ChatContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  messages: ChatMessage[];
  loading: boolean;
  sessionId: number | null;
  sendMessage: (text: string) => Promise<void>;
  quickAsk: (text: string) => void;
  resetChat: () => void;
  compareIds: number[];
  toggleCompare: (productId: number) => void;
  clearCompare: () => void;
  isComparing: boolean;
  setIsComparing: (val: boolean) => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  message: 'Hello! I am **BuySmart AI**, your personal shopping assistant. Ask me anything like:\n\n- *"I need a laptop under ₹60,000 for programming and ML"*\n- *"Which phone has the best camera under ₹25,000?"*\n- *"What is the store return and refund policy?"*',
  sources: ['BuySmart Knowledge Base', 'Verified Catalog DB']
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Reset session when authenticated account changes so chats aren't mixed across users
  useEffect(() => {
    setSessionId(null);
  }, [user?.id]);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen(prev => !prev);
  const resetChat = () => {
    setSessionId(null);
    setMessages([WELCOME_MESSAGE]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Optimistically add user turn
    const userMsg: ChatMessage = { role: 'user', message: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.askAssistant(text, sessionId || undefined);
      if (!sessionId && res.session_id) {
        setSessionId(res.session_id);
      }

      const asstMsg: ChatMessage = {
        role: 'assistant',
        message: res.reply,
        referenced_products: res.referenced_products,
        sources: res.sources,
      };
      setMessages(prev => [...prev, asstMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          message: `⚠️ Sorry, I encountered an issue retrieving that information: ${err.message || 'Please check your connection and try again.'}`,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickAsk = (text: string) => {
    setIsOpen(true);
    sendMessage(text);
  };

  const toggleCompare = (productId: number) => {
    setCompareIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        if (prev.length >= 4) {
          alert('You can compare a maximum of 4 products simultaneously.');
          return prev;
        }
        return [...prev, productId];
      }
    });
  };

  const clearCompare = () => setCompareIds([]);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        openChat,
        closeChat,
        toggleChat,
        messages,
        loading,
        sessionId,
        sendMessage,
        quickAsk,
        resetChat,
        compareIds,
        toggleCompare,
        clearCompare,
        isComparing,
        setIsComparing,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
