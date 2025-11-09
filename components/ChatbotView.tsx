'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, Sparkles, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  confidence?: 'high' | 'medium' | 'low';
  context?: string[];
  timestamp: Date;
}

interface ChatbotViewProps {
  spaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotView({ spaceId, isOpen, onClose }: ChatbotViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. I have access to all the information from your 7-step product development workflow. Ask me anything about your space, solutions, user stories, team members, RICE scores, OKRs, wireframes, or Jira tickets!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/spaces/${spaceId}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.answer,
        confidence: data.data.confidence,
        context: data.data.context,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your question. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConfidenceBadge = (confidence?: 'high' | 'medium' | 'low') => {
    if (!confidence) return null;

    const styles = {
      high: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', text: 'High Confidence' },
      medium: { bg: 'rgba(251, 191, 36, 0.1)', color: '#F59E0B', text: 'Medium Confidence' },
      low: { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', text: 'Low Confidence' },
    };

    const style = styles[confidence];

    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-2"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        <Sparkles className="w-3 h-3" />
        {style.text}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 pointer-events-none">
      <div
        className="bg-white rounded-lg shadow-2xl flex flex-col pointer-events-auto"
        style={{
          width: '400px',
          maxWidth: '100%',
          height: '600px',
          maxHeight: '80vh',
          border: '1px solid #E5E5E5',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{
            borderColor: '#E5E5E5',
            backgroundColor: '#9B6B7A',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Bot className="w-6 h-6" style={{ color: '#9B6B7A' }} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">AI Assistant</h3>
              <p className="text-xs text-white opacity-90">Ask me about your space</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-50 to-pink-50'
                    : 'bg-gray-50'
                }`}
                style={{
                  border: message.role === 'user' ? '1px solid rgba(155, 107, 122, 0.2)' : '1px solid #E5E5E5',
                }}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4" style={{ color: '#9B6B7A' }} />
                    <span className="text-xs font-medium" style={{ color: '#9B6B7A' }}>
                      Assistant
                    </span>
                  </div>
                )}
                <p className="text-sm leading-relaxed" style={{ color: '#1A1A1A', whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </p>
                {message.confidence && getConfidenceBadge(message.confidence)}
                {message.context && message.context.length > 0 && (
                  <details className="mt-3">
                    <summary className="text-xs cursor-pointer" style={{ color: '#6B6B6B' }}>
                      View sources ({message.context.length})
                    </summary>
                    <ul className="mt-2 space-y-1 text-xs" style={{ color: '#6B6B6B' }}>
                      {message.context.map((ctx, idx) => (
                        <li key={idx} className="pl-2 border-l-2" style={{ borderColor: '#E5E5E5' }}>
                          {ctx}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 rounded-lg p-3" style={{ border: '1px solid #E5E5E5' }}>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#9B6B7A' }} />
                  <span className="text-sm" style={{ color: '#6B6B6B' }}>
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: '#E5E5E5' }}>
          <div className="flex items-end gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg text-sm resize-none"
              style={{
                border: '1px solid #E5E5E5',
                color: '#1A1A1A',
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 rounded-lg font-medium text-sm text-white transition-all duration-200 flex items-center justify-center"
              style={{
                backgroundColor: !input.trim() || isLoading ? '#D1D5DB' : '#9B6B7A',
                cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                minWidth: '48px',
              }}
              onMouseEnter={(e) => {
                if (input.trim() && !isLoading) {
                  e.currentTarget.style.backgroundColor = '#8A5A69';
                }
              }}
              onMouseLeave={(e) => {
                if (input.trim() && !isLoading) {
                  e.currentTarget.style.backgroundColor = '#9B6B7A';
                }
              }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Suggested questions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setInput("What's the selected solution?")}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              style={{
                border: '1px solid #E5E5E5',
                color: '#6B6B6B',
              }}
            >
              Selected solution?
            </button>
            <button
              onClick={() => setInput("How many team members do we have?")}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              style={{
                border: '1px solid #E5E5E5',
                color: '#6B6B6B',
              }}
            >
              Team size?
            </button>
            <button
              onClick={() => setInput("What are the main OKRs?")}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              style={{
                border: '1px solid #E5E5E5',
                color: '#6B6B6B',
              }}
            >
              Main OKRs?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
