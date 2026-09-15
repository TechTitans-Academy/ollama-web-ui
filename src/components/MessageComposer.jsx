import React, { useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';

export function MessageComposer({
  input,
  setInput,
  onSend,
  onStop,
  isStreaming,
  disabled,
  selectedModel,
}) {
  const textareaRef = useRef(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming && !disabled) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full bg-gradient-to-t from-chatgpt-main via-chatgpt-main to-transparent pt-4 pb-4 px-4 md:px-6">
      <div className="max-w-3xl mx-auto relative">
        <div className="relative bg-chatgpt-card rounded-2xl border border-chatgpt-border shadow-2xl focus-within:border-gray-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? "No Ollama models found. Please pull a model first..."
                : `Message ${selectedModel || 'Ollama'}...`
            }
            disabled={disabled}
            rows={1}
            className="w-full py-3.5 pl-4 pr-12 bg-transparent text-chatgpt-textPrimary placeholder-chatgpt-textMuted text-sm md:text-base focus:outline-none resize-none max-h-48 overflow-y-auto"
          />

          {/* Send or Stop Action Button */}
          <div className="absolute right-2.5 bottom-2.5">
            {isStreaming ? (
              <button
                onClick={onStop}
                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors shadow"
                title="Stop generating"
              >
                <Square size={14} className="fill-black" />
              </button>
            ) : (
              <button
                onClick={onSend}
                disabled={!input.trim() || disabled}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow ${
                  input.trim() && !disabled
                    ? 'bg-white text-black hover:bg-gray-200 cursor-pointer'
                    : 'bg-[#3e3e3e] text-gray-500 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Footer info label */}
        <p className="text-[11px] text-center text-chatgpt-textMuted mt-2">
          Local Ollama AI • Responses are generated locally on your MacBook
        </p>
      </div>
    </div>
  );
}
