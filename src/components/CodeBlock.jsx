import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import hljs from 'highlight.js';

export function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHighlightedCode = () => {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(code, { language }).value;
      } catch (e) {
        // fallback
      }
    }
    return hljs.highlightAuto(code).value;
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-chatgpt-border bg-[#0d0d0d] font-mono text-xs sm:text-sm">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#1e1e1e] text-chatgpt-textSecondary border-b border-chatgpt-border">
        <span className="font-sans font-medium text-xs lowercase text-gray-400">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors py-1 px-2 rounded hover:bg-[#2d2d2d]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="font-sans">Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-gray-200">
        <pre>
          <code
            dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
            className={`language-${language || 'text'}`}
          />
        </pre>
      </div>
    </div>
  );
}
