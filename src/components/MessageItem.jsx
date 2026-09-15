import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Bot, User, Copy, Check, RotateCw, Edit2, Zap } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { ErrorBoundary } from './ErrorBoundary';

export function MessageItem({
  message,
  isStreaming,
  isLast,
  onRegenerate,
  onEditMessage,
}) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isUser = message.role === 'user';

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && onEditMessage) {
      onEditMessage(editContent.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className={`py-6 px-4 md:px-6 w-full ${isUser ? 'bg-chatgpt-main' : 'bg-[#1b1b1b] border-y border-[#292929]'}`}>
      <div className="max-w-3xl mx-auto flex gap-4 md:gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-semibold text-sm shadow">
              <User size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#10a37f] text-white flex items-center justify-center shadow">
              <Bot size={19} />
            </div>
          )}
        </div>

        {/* Message Body & Actions */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Name & Timestamp/Model */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-chatgpt-textPrimary">
              {isUser ? 'You' : 'Ask Me Anything..'}
            </span>
            {message.model && (
              <span className="text-xs text-chatgpt-textMuted bg-[#2a2a2a] px-2 py-0.5 rounded border border-[#383838]">
                {message.model}
              </span>
            )}
          </div>

          {/* Editing state for User */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 bg-chatgpt-card text-chatgpt-textPrimary rounded-lg border border-chatgpt-border focus:outline-none focus:border-chatgpt-accent text-sm resize-y"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-chatgpt-textSecondary hover:bg-chatgpt-hover rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 text-xs bg-chatgpt-accent hover:bg-chatgpt-accentHover text-white rounded font-medium"
                >
                  Save & Submit
                </button>
              </div>
            </div>
          ) : (
            /* Rendered Content */
            <div className={`prose-chatgpt ${isStreaming && isLast ? 'streaming-cursor' : ''}`}>
              <ErrorBoundary rawContent={message.content}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = Array.isArray(children)
                        ? children.join('')
                        : String(children ?? '');
                      const isBlock = match || Boolean(className) || codeString.includes('\n');

                      return isBlock ? (
                        <CodeBlock
                          language={match ? match[1] : ''}
                          code={codeString.replace(/\n$/, '')}
                        />
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </ErrorBoundary>
            </div>
          )}

          {/* Generation Performance Stats (Tokens/sec) */}
          {message.stats?.tokensPerSec > 0 && !isStreaming && (
            <div className="flex items-center gap-1.5 text-[11px] text-chatgpt-textMuted pt-1">
              <Zap size={12} className="text-emerald-500" />
              <span>{message.stats.tokensPerSec} tokens/sec</span>
              <span>•</span>
              <span>{message.stats.evalCount} tokens</span>
            </div>
          )}

          {/* Message Toolbar Actions */}
          {!isStreaming && !isEditing && (
            <div className="flex items-center gap-2 pt-2 text-chatgpt-textMuted text-xs">
              <button
                onClick={handleCopyMessage}
                className="p-1 hover:text-chatgpt-textPrimary rounded hover:bg-chatgpt-hover transition-colors flex items-center gap-1"
                title="Copy message"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>

              {isUser ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:text-chatgpt-textPrimary rounded hover:bg-chatgpt-hover transition-colors"
                  title="Edit prompt"
                >
                  <Edit2 size={14} />
                </button>
              ) : (
                isLast && onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1 hover:text-chatgpt-textPrimary rounded hover:bg-chatgpt-hover transition-colors flex items-center gap-1"
                    title="Regenerate response"
                  >
                    <RotateCw size={14} />
                    <span className="text-[11px]">Regenerate</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
