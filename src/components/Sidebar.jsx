import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Check,
  X,
  Radio,
} from 'lucide-react';

export function Sidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onRenameThread,
  onTogglePinThread,
  onDeleteThread,
  onOpenSettings,
  onOpenPullModal,
  isOpen,
  onToggleOpen,
  ollamaConnected,
  modelsCount,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter threads
  const filteredThreads = threads.filter((thread) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = thread.title.toLowerCase().includes(q);
    const messageMatch = thread.messages.some((m) =>
      m.content.toLowerCase().includes(q)
    );
    return titleMatch || messageMatch;
  });

  const pinnedThreads = filteredThreads.filter((t) => t.isPinned);
  const unpinnedThreads = filteredThreads.filter((t) => !t.isPinned);

  const startEditing = (e, thread) => {
    e.stopPropagation();
    setEditingThreadId(thread.id);
    setEditTitle(thread.title);
  };

  const saveEditing = (e, threadId) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameThread(threadId, editTitle.trim());
    }
    setEditingThreadId(null);
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingThreadId(null);
  };

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-chatgpt-sidebar border-r border-[#262626] flex flex-col transition-all duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden'
        }`}
      >
        {/* Top bar with New Chat & Collapse */}
        <div className="p-3 flex items-center justify-between gap-2">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center gap-2 px-3 py-2 bg-chatgpt-main hover:bg-chatgpt-hover border border-chatgpt-border text-chatgpt-textPrimary rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={18} className="text-gray-300" />
            <span>New chat</span>
          </button>

          <button
            onClick={onToggleOpen}
            className="p-2 text-chatgpt-textMuted hover:text-chatgpt-textPrimary hover:bg-chatgpt-hover rounded-lg transition-colors"
            title="Close sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-3 py-1">
          <div className="relative flex items-center bg-[#212121] rounded-lg border border-[#333333] px-2.5 py-1.5 focus-within:border-gray-500">
            <Search size={14} className="text-chatgpt-textMuted mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-transparent text-xs text-chatgpt-textPrimary placeholder-chatgpt-textMuted focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-chatgpt-textMuted hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
          {/* Pinned Threads */}
          {pinnedThreads.length > 0 && (
            <div>
              <div className="px-3 text-[11px] font-semibold text-chatgpt-textMuted uppercase tracking-wider mb-1 flex items-center gap-1">
                <Pin size={11} /> Pinned
              </div>
              <div className="space-y-0.5">
                {pinnedThreads.map((thread) => (
                  <ThreadRow
                    key={thread.id}
                    thread={thread}
                    activeThreadId={activeThreadId}
                    editingThreadId={editingThreadId}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelectThread={onSelectThread}
                    startEditing={startEditing}
                    saveEditing={saveEditing}
                    cancelEditing={cancelEditing}
                    onTogglePinThread={onTogglePinThread}
                    onDeleteThread={onDeleteThread}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All / Recent Threads */}
          <div>
            {pinnedThreads.length > 0 && (
              <div className="px-3 text-[11px] font-semibold text-chatgpt-textMuted uppercase tracking-wider mb-1">
                Recent
              </div>
            )}
            {unpinnedThreads.length === 0 && pinnedThreads.length === 0 ? (
              <div className="text-center py-8 text-xs text-chatgpt-textMuted">
                No chats found
              </div>
            ) : (
              <div className="space-y-0.5">
                {unpinnedThreads.map((thread) => (
                  <ThreadRow
                    key={thread.id}
                    thread={thread}
                    activeThreadId={activeThreadId}
                    editingThreadId={editingThreadId}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelectThread={onSelectThread}
                    startEditing={startEditing}
                    saveEditing={saveEditing}
                    cancelEditing={cancelEditing}
                    onTogglePinThread={onTogglePinThread}
                    onDeleteThread={onDeleteThread}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom User & System Status Area */}
        <div className="p-3 border-t border-[#262626] space-y-2">
          {/* Ollama Connection Indicator */}
          <div className="flex items-center justify-between px-2 py-1.5 text-xs text-chatgpt-textSecondary bg-[#212121] rounded-lg border border-[#2e2e2e]">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  ollamaConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="font-medium">
                {ollamaConnected ? 'Ollama Online' : 'Ollama Offline'}
              </span>
            </div>
            <button
              onClick={onOpenPullModal}
              className="text-[11px] text-chatgpt-accent hover:underline flex items-center gap-1"
            >
              <Sparkles size={12} /> {modelsCount} models
            </button>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-chatgpt-textSecondary hover:text-white hover:bg-chatgpt-hover rounded-lg transition-colors"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function ThreadRow({
  thread,
  activeThreadId,
  editingThreadId,
  editTitle,
  setEditTitle,
  onSelectThread,
  startEditing,
  saveEditing,
  cancelEditing,
  onTogglePinThread,
  onDeleteThread,
}) {
  const isActive = thread.id === activeThreadId;
  const isEditing = thread.id === editingThreadId;

  return (
    <div
      onClick={() => onSelectThread(thread.id)}
      className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
        isActive
          ? 'bg-[#2f2f2f] text-white font-medium'
          : 'text-chatgpt-textSecondary hover:bg-[#252525] hover:text-chatgpt-textPrimary'
      }`}
    >
      <MessageSquare size={15} className="flex-shrink-0 text-gray-400" />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-[#171717] border border-gray-500 text-white rounded px-1.5 py-0.5 text-xs focus:outline-none"
            autoFocus
          />
          <button onClick={(e) => saveEditing(e, thread.id)} className="text-emerald-400 hover:text-emerald-300">
            <Check size={14} />
          </button>
          <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-200">
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 truncate">{thread.title || 'Untitled Chat'}</span>

          {/* Action buttons on hover or active */}
          <div className="hidden group-hover:flex items-center gap-1 text-gray-400">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinThread(thread.id);
              }}
              className="p-1 hover:text-white rounded"
              title={thread.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin size={13} className={thread.isPinned ? 'fill-white text-white' : ''} />
            </button>
            <button
              onClick={(e) => startEditing(e, thread)}
              className="p-1 hover:text-white rounded"
              title="Rename"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteThread(thread.id);
              }}
              className="p-1 hover:text-red-400 rounded"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
