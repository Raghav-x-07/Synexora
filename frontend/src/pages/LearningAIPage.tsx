import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import API from '../lib/api';
import { Bot, Send, Trash2, Sparkles, User as UserIcon, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const LearningAIPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your Synexora AI learning assistant powered by Groq. Ask me to break down a difficult topic, quiz you, or solve a problem step-by-step.',
      timestamp: '10:00 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userPrompt = inputText.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setErrorMessage(null);

    try {
      const res = await API.post('/ai/chat', {
        prompt: userPrompt,
        history: messages,
        learningStyle: user?.preferences?.learningStyle || 'socratic',
        subject: user?.major,
      });

      if (res.data.success && res.data.reply) {
        const aiReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiReply]);
      } else {
        throw new Error(res.data.message || 'No reply received');
      }
    } catch (err: any) {
      console.error('AI chat error:', err);
      const errMsg = err.response?.data?.message || 'Failed to reach AI tutor. Please check backend connection.';
      setErrorMessage(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `[Error: ${errMsg}]`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
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
    setErrorMessage(null);
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
              <span className="text-[10px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                Groq Live
              </span>
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

        {errorMessage && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

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
                <span>Groq AI is thinking...</span>
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
              disabled={isTyping}
              className="input-clean flex-1 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
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
