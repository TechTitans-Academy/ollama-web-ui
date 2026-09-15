import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_THREADS = 'ollama_chatgpt_threads';
const STORAGE_KEY_ACTIVE = 'ollama_chatgpt_active_thread_id';
const STORAGE_KEY_SETTINGS = 'ollama_chatgpt_settings';

const DEFAULT_SETTINGS = {
  selectedModel: '',
  systemPrompt: 'You are a helpful, clever, and articulate assistant. Answer directly and format code using markdown.',
  temperature: 0.7,
};

export function useChatStorage() {
  const [threads, setThreads] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THREADS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load threads from localStorage", e);
      return [];
    }
  });

  const [activeThreadId, setActiveThreadId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ACTIVE) || null;
    } catch (e) {
      return null;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  // Save threads to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));
    } catch (e) {
      console.error("Failed to save threads", e);
    }
  }, [threads]);

  // Save active thread ID
  useEffect(() => {
    try {
      if (activeThreadId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, activeThreadId);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE);
      }
    } catch (e) {
      console.error("Failed to save active thread ID", e);
    }
  }, [activeThreadId]);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  }, [settings]);

  // Ensure there's always an active thread or null
  const activeThread = threads.find(t => t.id === activeThreadId) || null;

  const createNewThread = useCallback(() => {
    const newThread = {
      id: 'thread_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
    };

    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    return newThread;
  }, []);

  const updateThreadMessages = useCallback((threadId, updateFnOrMessages) => {
    setThreads(prevThreads => {
      return prevThreads.map(thread => {
        if (thread.id !== threadId) return thread;

        const updatedMessages = typeof updateFnOrMessages === 'function' 
          ? updateFnOrMessages(thread.messages)
          : updateFnOrMessages;

        // Auto generate title if it's currently 'New Chat' and we have user messages
        let title = thread.title;
        if ((title === 'New Chat' || !title) && updatedMessages.length > 0) {
          const firstUserMsg = updatedMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            title = firstUserMsg.content.slice(0, 36).trim() + (firstUserMsg.content.length > 36 ? '...' : '');
          }
        }

        return {
          ...thread,
          title,
          messages: updatedMessages,
          updatedAt: new Date().toISOString(),
        };
      });
    });
  }, []);

  const renameThread = useCallback((threadId, newTitle) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, title: newTitle, updatedAt: new Date().toISOString() } : t));
  }, []);

  const togglePinThread = useCallback((threadId) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, isPinned: !t.isPinned } : t));
  }, []);

  const deleteThread = useCallback((threadId) => {
    setThreads(prev => {
      const filtered = prev.filter(t => t.id !== threadId);
      if (activeThreadId === threadId) {
        setActiveThreadId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [activeThreadId]);

  const clearAllThreads = useCallback(() => {
    setThreads([]);
    setActiveThreadId(null);
  }, []);

  const updateSettings = useCallback((newPartialSettings) => {
    setSettings(prev => ({ ...prev, ...newPartialSettings }));
  }, []);

  return {
    threads,
    activeThread,
    activeThreadId,
    settings,
    createNewThread,
    selectThread: setActiveThreadId,
    updateThreadMessages,
    renameThread,
    togglePinThread,
    deleteThread,
    clearAllThreads,
    updateSettings,
  };
}
