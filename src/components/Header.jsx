import React, { useState } from 'react';
import {
  PanelLeftOpen,
  ChevronDown,
  Sparkles,
  Download,
  SlidersHorizontal,
  Trash2,
  Share2,
  Check,
  Zap,
} from 'lucide-react';

export function Header({
  models,
  selectedModel,
  onSelectModel,
  onOpenPullModal,
  onOpenSettings,
  onClearMessages,
  onExportChat,
  sidebarOpen,
  onToggleSidebar,
}) {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  return (
    <header className="h-14 border-b border-chatgpt-border bg-[#1d1d1d]/80 backdrop-blur px-4 flex items-center justify-between z-10 select-none">
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle Button if collapsed or on mobile */}
        {(!sidebarOpen || window.innerWidth < 768) && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-chatgpt-textSecondary hover:text-white hover:bg-chatgpt-hover rounded-lg transition-colors"
            title="Open sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-chatgpt-textPrimary hover:bg-[#2c2c2c] transition-colors border border-transparent hover:border-chatgpt-border font-semibold text-base"
          >
            <span>{selectedModel || 'Select Model'}</span>
            <ChevronDown size={16} className="text-chatgpt-textMuted" />
          </button>

          {/* Model Dropdown Menu */}
          {modelDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setModelDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 bg-[#252525] border border-[#383838] rounded-2xl shadow-2xl z-30 p-1.5 space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-chatgpt-textMuted border-b border-[#333] flex justify-between items-center">
                  <span>INSTALLED OLLAMA MODELS</span>
                  <button
                    onClick={() => {
                      setModelDropdownOpen(false);
                      onOpenPullModal();
                    }}
                    className="text-chatgpt-accent hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Download size={12} /> Pull New
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-0.5">
                  {models.length === 0 ? (
                    <div className="p-3 text-center text-xs text-chatgpt-textMuted">
                      No models installed in Ollama.
                    </div>
                  ) : (
                    models.map((m) => {
                      const isSelected = m.name === selectedModel;
                      const sizeInGB = (m.size / (1024 * 1024 * 1024)).toFixed(1);
                      return (
                        <button
                          key={m.name}
                          onClick={() => {
                            onSelectModel(m.name);
                            setModelDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-left transition-colors ${
                            isSelected
                              ? 'bg-chatgpt-hover text-white font-semibold'
                              : 'text-chatgpt-textSecondary hover:bg-[#2f2f2f] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Zap size={14} className={isSelected ? 'text-emerald-400' : 'text-gray-400'} />
                            <div>
                              <div className="font-medium text-sm leading-none">{m.name}</div>
                              <div className="text-[10px] text-chatgpt-textMuted mt-1">{sizeInGB} GB</div>
                            </div>
                          </div>
                          {isSelected && <Check size={16} className="text-emerald-400" />}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-[#333] pt-1">
                  <button
                    onClick={() => {
                      setModelDropdownOpen(false);
                      onOpenPullModal();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs text-chatgpt-textSecondary hover:text-white hover:bg-[#2f2f2f] rounded-xl font-medium transition-colors"
                  >
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Download more models...</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenSettings}
          className="p-2 text-chatgpt-textSecondary hover:text-white hover:bg-chatgpt-hover rounded-lg transition-colors flex items-center gap-1 text-xs"
          title="Adjust Parameters & System Prompt"
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Settings</span>
        </button>

        {onExportChat && (
          <button
            onClick={onExportChat}
            className="p-2 text-chatgpt-textSecondary hover:text-white hover:bg-chatgpt-hover rounded-lg transition-colors"
            title="Export conversation"
          >
            <Share2 size={16} />
          </button>
        )}

        {onClearMessages && (
          <button
            onClick={onClearMessages}
            className="p-2 text-chatgpt-textSecondary hover:text-red-400 hover:bg-chatgpt-hover rounded-lg transition-colors"
            title="Clear chat"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
