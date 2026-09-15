import React, { useRef, useEffect } from 'react';
import { Bot, Code2, Lightbulb, Compass, Sparkles } from 'lucide-react';
import { MessageItem } from './MessageItem';

const SUGGESTIONS = [
  {
    icon: Code2,
    title: 'Write a Python script',
    subtitle: 'to parse JSON data and extract key values',
    prompt: 'Write a clean Python script to parse a nested JSON object and extract specific keys safely.',
  },
  {
    icon: Lightbulb,
    title: 'Explain a complex concept',
    subtitle: 'like quantum computing in simple terms',
    prompt: 'Explain quantum computing and qubits to me as if I were 10 years old.',
  },
  {
    icon: Compass,
    title: 'Design a web layout',
    subtitle: 'with responsive HTML and modern Tailwind CSS',
    prompt: 'Create a modern hero section layout using HTML and Tailwind CSS with glassmorphism.',
  },
  {
    icon: Sparkles,
    title: 'Debug & optimize code',
    subtitle: 'identify memory leaks or performance bottlenecks',
    prompt: 'How do I optimize React re-renders and memory performance in large application lists?',
  },
];

export function ChatContainer({
  messages,
  isStreaming,
  onSendPrompt,
  onRegenerate,
  onEditMessage,
  selectedModel,
}) {
  const bottomRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-xl mx-auto space-y-6">
          {/* Logo emblem */}
          <div className="w-16 h-16 rounded-full bg-chatgpt-card border border-chatgpt-border flex items-center justify-center mx-auto shadow-2xl">
            <Bot size={36} className="text-[#10a37f]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-chatgpt-textPrimary tracking-tight">
              What can I help with today?
            </h1>
            <p className="text-sm text-chatgpt-textMuted">
              Running locally with <span className="text-chatgpt-accent font-medium">{selectedModel || 'Ollama'}</span>
            </p>
          </div>

          {/* Quick Suggestion Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            {SUGGESTIONS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSendPrompt(s.prompt)}
                  className="p-4 bg-[#232323] hover:bg-[#2c2c2c] border border-[#333333] hover:border-gray-500 rounded-2xl text-left transition-all duration-200 group flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-chatgpt-textPrimary group-hover:text-white">
                      {s.title}
                    </span>
                    <Icon size={16} className="text-chatgpt-textMuted group-hover:text-chatgpt-accent transition-colors" />
                  </div>
                  <span className="text-xs text-chatgpt-textMuted group-hover:text-gray-300">
                    {s.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-[#292929]">
        {messages.map((msg, index) => (
          <MessageItem
            key={index}
            message={msg}
            isStreaming={isStreaming}
            isLast={index === messages.length - 1}
            onRegenerate={onRegenerate}
            onEditMessage={(newText) => onEditMessage(index, newText)}
          />
        ))}
      </div>
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
