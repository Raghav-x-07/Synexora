import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Bot, Send, Trash2, Sparkles, User as UserIcon } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const LearningAIPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your Synexora AI learning assistant. Ask me to explain a concept, summarize lecture points, or help you solve a problem step-by-step.',
      timestamp: '10:00 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Regarding "${userMsg.text}": Let's break this down systematically. Step 1: Identify the main definition and boundaries. Step 2: Examine how the primary variables interact. Would you like a detailed example or a practice question?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 600);
  };

  const handleClear = () => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: 'Conversation cleared. How can I assist your study session today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const setPrompt = (text: string) => {
    setInputText(text);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-green-600" />
              <span>Learning AI Tutor</span>
            </h1>
            <p className="text-xs text-slate-500">
              Interactive conceptual explanations and study assistance
            </p>
          </div>
          <button
            onClick={handleClear}
            className="btn-secondary text-xs flex items-center gap-1.5"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Quick Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 shrink-0 font-medium">Suggestions:</span>
          <button
            onClick={() => setPrompt('Explain the difference between TCP and UDP with simple examples')}
            className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0"
          >
            TCP vs UDP
          </button>
          <button
            onClick={() => setPrompt('How does binary search achieve O(log n) time complexity?')}
            className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0"
          >
            Binary Search Complexity
          </button>
          <button
            onClick={() => setPrompt('Give me a 3-step study plan for my Linear Algebra midterm')}
            className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0"
          >
            Linear Algebra Plan
          </button>
        </div>

        {/* Chat Box */}
        <div className="bg-white border border-slate-200 rounded-lg h-[500px] flex flex-col justify-between">
          {/* Messages list */}
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center text-xs font-semibold shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-slate-800 text-white'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-xl p-3.5 rounded-lg text-sm ${
                    msg.sender === 'user'
                      ? 'bg-green-50 text-slate-900 border border-green-200'
                      : 'bg-slate-50 text-slate-800 border border-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
                <Sparkles className="w-3.5 h-3.5 text-green-600 animate-spin" />
                <span>AI is formulating response...</span>
              </div>
            )}
          </div>

          {/* Prompt input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question about your subject..."
              className="input-clean flex-1"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="btn-primary px-4 gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};
