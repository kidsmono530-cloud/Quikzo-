import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User, Minimize2, ShoppingCart, Eye, ArrowRight, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
  timestamp: string;
}

interface QuikzoAssistantProps {
  onSelectProduct?: (product: Product) => void;
  onOpenCheckout?: () => void;
}

export const QuikzoAssistant: React.FC<QuikzoAssistantProps> = ({ onSelectProduct, onOpenCheckout }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Assalamu Alaikum! 👋 Welcome to Quikzo.\n\nMain Quikzo Assistant hoon. Aap mujhse grocery products, prices, offers, orders, delivery ya kisi bhi general sawal ke baare mein pooch sakte hain.\n\nBataiye, main aapki kya madad karun?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const quickSuggestions = [
    'Find Products',
    "Today's Deals",
    'Track My Order',
    'How to Order',
    'About Quikzo',
    'Ask Anything'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          userToken: localStorage.getItem('quikzo_customer_token') || ''
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        products: data.products || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Maaf kijiye, abhi server se connect karne mein kuch dikkat aa rahi hai. Kripya thodi der baad dobara koshish karein.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation clear kar di gayi hai. Bataiye, Quikzo Assistant aapki kya madad kar sakta hai?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFCC00] hover:bg-[#E6B800] text-[#0B0B0B] shadow-md flex items-center justify-center z-30 transition-all duration-200 active:scale-95 border border-amber-300"
          aria-label="Open Quikzo Assistant"
          title="Quikzo Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#0B0B0B]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full animate-pulse"></span>
          </div>
        </button>
      )}

      {/* Chat Window Modal / Drawer */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 shadow-2xl bg-white border border-gray-200 flex flex-col ${
          isMinimized
            ? 'bottom-4 right-4 w-72 h-14 rounded-2xl overflow-hidden'
            : 'bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[420px] h-[90vh] sm:h-[620px] rounded-none sm:rounded-3xl overflow-hidden'
        }`}>
          {/* Header */}
          <div className="bg-black text-white px-4 py-3.5 flex items-center justify-between border-b border-yellow-400/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></span>
              </div>
              <div>
                <h3 className="font-extrabold text-yellow-400 flex items-center gap-1.5 text-base">
                  Quikzo Assistant <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
                </h3>
                <p className="text-xs text-gray-300">Online • 10-15 Min Grocery AI</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearChat}
                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition"
                title="Clear Chat"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Suggestions Chips */}
              <div className="bg-yellow-50 px-3 py-2 border-b border-yellow-200/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {quickSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion)}
                    className="whitespace-nowrap bg-white hover:bg-yellow-400 hover:text-black text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-yellow-300 shadow-sm transition flex-shrink-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/70">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[85%]">
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-black text-yellow-400 flex items-center justify-center shrink-0 mb-1">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      <div
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-yellow-400 text-black font-medium rounded-br-none'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-yellow-400 text-black flex items-center justify-center shrink-0 mb-1 font-bold">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-gray-400 mt-1 px-9">
                      {msg.timestamp}
                    </span>

                    {/* Inline Product Cards if attached */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 w-full space-y-2 pl-9">
                        <p className="text-xs font-bold text-gray-600">Recommended Products:</p>
                        <div className="grid grid-cols-1 gap-2.5">
                          {msg.products.map(prod => (
                            <div key={prod.id} className="bg-white border border-yellow-300 rounded-xl p-3 shadow-sm flex items-center gap-3">
                              <img
                                src={prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'}
                                alt={prod.name}
                                className="w-14 h-14 object-cover rounded-lg bg-gray-100 shrink-0 border"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs text-gray-900 truncate">{prod.name}</h4>
                                <p className="text-[11px] text-gray-500">{prod.weight} • {prod.brand}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-extrabold text-sm text-black">₹{prod.sellingPrice}</span>
                                  {prod.mrp > prod.sellingPrice && (
                                    <span className="text-xs text-gray-400 line-through">₹{prod.mrp}</span>
                                  )}
                                  {prod.discountPercentage > 0 && (
                                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">
                                      {prod.discountPercentage}% OFF
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col gap-1.5 shrink-0">
                                {onSelectProduct && (
                                  <button
                                    onClick={() => onSelectProduct(prod)}
                                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center justify-center"
                                    title="View Product"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => addToCart(prod, 1)}
                                  className="p-1.5 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg text-xs font-bold flex items-center justify-center shadow-sm"
                                  title="Add to Cart"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-gray-500 text-xs italic pl-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce delay-200"></div>
                    <span>Quikzo Assistant is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask in Hindi, English, Urdu, Hinglish..."
                  className="flex-1 bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 focus:bg-white transition"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || loading}
                  className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black p-2.5 rounded-xl font-bold transition shadow-md flex items-center justify-center shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
