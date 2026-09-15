import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChatStorage } from './hooks/useChatStorage';
import { getModels, streamChatCompletion } from './services/ollamaApi';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatContainer } from './components/ChatContainer';
import { MessageComposer } from './components/MessageComposer';
import { ModelSelectorModal } from './components/ModelSelectorModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const {
    threads,
    activeThread,
    activeThreadId,
    settings,
    createNewThread,
    selectThread,
    updateThreadMessages,
    renameThread,
    togglePinThread,
    deleteThread,
    clearAllThreads,
    updateSettings,
  } = useChatStorage();

  // Ollama Models state
  const [models, setModels] = useState([]);
  const [ollamaConnected, setOllamaConnected] = useState(true);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Modals & UI toggles
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPullModalOpen, setIsPullModalOpen] = useState(false);

  const abortControllerRef = useRef(null);

  // Fetch installed models
  const refreshModels = useCallback(async () => {
    try {
      const list = await getModels();
      setModels(list);
      setOllamaConnected(true);

      // Select default model if none selected or selected model is missing
      if (list.length > 0) {
        if (!settings.selectedModel || !list.some(m => m.name === settings.selectedModel)) {
          updateSettings({ selectedModel: list[0].name });
        }
      }
    } catch (e) {
      console.warn("Could not connect to local Ollama:", e);
      setOllamaConnected(false);
    }
  }, [settings.selectedModel, updateSettings]);

  useEffect(() => {
    refreshModels();
  }, []);

  // Ensure an active thread exists when sending message
  const ensureActiveThread = () => {
    if (activeThreadId && activeThread) {
      return activeThreadId;
    }
    const newThread = createNewThread();
    return newThread.id;
  };

  // Stop Generation stream
  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Send message to Ollama
  const handleSendPrompt = async (textToSend) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isStreaming) return;

    const threadId = ensureActiveThread();
    setInput('');

    // Prepare User message
    const userMessage = {
      role: 'user',
      content: promptText,
      timestamp: new Date().toISOString(),
    };

    // Prepare Assistant placeholder
    const assistantMessagePlaceholder = {
      role: 'assistant',
      content: '',
      model: settings.selectedModel,
      timestamp: new Date().toISOString(),
    };

    // Update state with user msg & assistant placeholder
    let currentMessages = [];
    if (activeThread && activeThread.id === threadId) {
      currentMessages = [...activeThread.messages, userMessage];
    } else {
      currentMessages = [userMessage];
    }

    updateThreadMessages(threadId, [...currentMessages, assistantMessagePlaceholder]);

    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await streamChatCompletion({
        model: settings.selectedModel,
        messages: currentMessages,
        systemPrompt: settings.systemPrompt,
        temperature: settings.temperature,
        signal: controller.signal,
        onChunk: (chunkText, accumulatedFullText) => {
          updateThreadMessages(threadId, (prevMsgs) => {
            const updated = [...prevMsgs];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: accumulatedFullText,
              };
            }
            return updated;
          });
        },
        onFinish: (finalText, stats) => {
          updateThreadMessages(threadId, (prevMsgs) => {
            const updated = [...prevMsgs];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: finalText,
                stats,
              };
            }
            return updated;
          });
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
        onError: (err) => {
          updateThreadMessages(threadId, (prevMsgs) => {
            const updated = [...prevMsgs];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: `⚠️ **Error generating response**: ${err.message || 'Check if Ollama server is running.'}`,
              };
            }
            return updated;
          });
          setIsStreaming(false);
          abortControllerRef.current = null;
        }
      });
    } catch (e) {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (!activeThread || activeThread.messages.length < 2 || isStreaming) return;
    const msgs = activeThread.messages;
    // Find last assistant message index
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg.role === 'assistant') {
      // Remove last assistant message
      const trimmedMsgs = msgs.slice(0, msgs.length - 1);
      updateThreadMessages(activeThreadId, trimmedMsgs);
      // Trigger stream using latest user prompt
      const lastUserMsg = trimmedMsgs[trimmedMsgs.length - 1];
      if (lastUserMsg && lastUserMsg.role === 'user') {
        handleSendPrompt(lastUserMsg.content);
      }
    }
  };

  // Edit previous user message
  const handleEditUserMessage = (msgIndex, newText) => {
    if (!activeThread) return;
    const trimmedMsgs = activeThread.messages.slice(0, msgIndex);
    updateThreadMessages(activeThreadId, trimmedMsgs);
    handleSendPrompt(newText);
  };

  // Export current chat
  const handleExportChat = () => {
    if (!activeThread) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeThread, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeThread.title || 'chat'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export all chats
  const handleExportAllChats = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(threads, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ask_me_anything_history.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex h-screen bg-chatgpt-main text-chatgpt-textPrimary overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={selectThread}
        onNewChat={createNewThread}
        onRenameThread={renameThread}
        onTogglePinThread={togglePinThread}
        onDeleteThread={deleteThread}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPullModal={() => setIsPullModalOpen(true)}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
        ollamaConnected={ollamaConnected}
        modelsCount={models.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Header */}
        <Header
          models={models}
          selectedModel={settings.selectedModel}
          onSelectModel={(modelName) => updateSettings({ selectedModel: modelName })}
          onOpenPullModal={() => setIsPullModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onClearMessages={
            activeThread && activeThread.messages.length > 0
              ? () => updateThreadMessages(activeThreadId, [])
              : null
          }
          onExportChat={activeThread ? handleExportChat : null}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Messages Container */}
        <ChatContainer
          messages={activeThread ? activeThread.messages : []}
          isStreaming={isStreaming}
          onSendPrompt={handleSendPrompt}
          onRegenerate={handleRegenerate}
          onEditMessage={handleEditUserMessage}
          selectedModel={settings.selectedModel}
        />

        {/* Input Composer */}
        <MessageComposer
          input={input}
          setInput={setInput}
          onSend={() => handleSendPrompt()}
          onStop={handleStopStream}
          isStreaming={isStreaming}
          disabled={!ollamaConnected}
          selectedModel={settings.selectedModel}
        />
      </div>

      {/* Modals */}
      <ModelSelectorModal
        isOpen={isPullModalOpen}
        onClose={() => setIsPullModalOpen(false)}
        models={models}
        onRefreshModels={refreshModels}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onClearAllThreads={clearAllThreads}
        onExportAllThreads={handleExportAllChats}
      />
    </div>
  );
}
