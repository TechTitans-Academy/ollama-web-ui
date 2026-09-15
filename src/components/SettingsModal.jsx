import React, { useState } from 'react';
import { X, Sliders, Server, Trash2, Download, CheckCircle, RefreshCw } from 'lucide-react';
import { getModels } from '../services/ollamaApi';

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllThreads,
  onExportAllThreads,
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const modelsList = await getModels();
      setTestResult({
        success: true,
        message: `Successfully connected to Ollama! Found ${modelsList.length} models.`,
      });
    } catch (e) {
      setTestResult({
        success: false,
        message: `Connection failed: ${e.message}. Is Ollama running on localhost:11434?`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#212121] border border-[#383838] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-chatgpt-hover"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* System Instructions */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-chatgpt-textMuted uppercase tracking-wider">
              System Instructions
            </label>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => onUpdateSettings({ systemPrompt: e.target.value })}
              rows={3}
              placeholder="e.g. You are an expert senior software engineer..."
              className="w-full bg-chatgpt-card border border-chatgpt-border rounded-xl p-3 text-xs text-white placeholder-chatgpt-textMuted focus:outline-none focus:border-chatgpt-accent resize-y"
            />
            <p className="text-[11px] text-chatgpt-textMuted">
              Sets the overall behavior and personality for Ollama responses.
            </p>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-chatgpt-textMuted uppercase tracking-wider">
                Temperature ({settings.temperature})
              </label>
              <span className="text-gray-400">
                {settings.temperature < 0.3 ? 'Precise / Deterministic' : settings.temperature > 0.8 ? 'Creative' : 'Balanced'}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.5"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => onUpdateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 bg-[#333] h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Connection Test */}
          <div className="p-4 bg-[#181818] border border-[#2e2e2e] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Server size={16} className="text-emerald-400" />
                <span>Ollama Endpoint</span>
              </div>
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-3 py-1 bg-[#2b2b2b] hover:bg-[#383838] text-xs font-medium text-white rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} className={testing ? 'animate-spin' : ''} />
                <span>Test Connection</span>
              </button>
            </div>
            <p className="text-[11px] text-chatgpt-textMuted font-mono">
              http://localhost:11434 (Proxied via /api)
            </p>
            {testResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                    : 'bg-red-950/60 border border-red-800 text-red-300'
                }`}
              >
                {testResult.success ? <CheckCircle size={15} /> : <X size={15} />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Data Management */}
          <div className="space-y-3 pt-2 border-t border-[#333]">
            <label className="block text-xs font-semibold text-chatgpt-textMuted uppercase tracking-wider">
              Data & Storage
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={onExportAllThreads}
                className="flex-1 py-2 px-3 bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-[#383838]"
              >
                <Download size={14} /> Export All Chats
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Delete all chat histories permanently?")) {
                    onClearAllThreads();
                    onClose();
                  }
                }}
                className="py-2 px-3 bg-red-950/40 hover:bg-red-900/60 text-xs font-medium text-red-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-red-900/60"
              >
                <Trash2 size={14} /> Clear All History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
