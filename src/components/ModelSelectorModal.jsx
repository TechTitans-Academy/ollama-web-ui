import React, { useState } from 'react';
import { X, Download, Trash2, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { pullModel, deleteModel } from '../services/ollamaApi';

const POPULAR_MODELS = [
  { name: 'llama3.2', desc: 'Meta’s state-of-the-art lightweight 3B model' },
  { name: 'qwen2.5', desc: 'Alibaba’s powerful high-accuracy reasoning model' },
  { name: 'mistral', desc: 'Mistral 7B fast instruction tuned model' },
  { name: 'gemma2', desc: 'Google’s high performance open weight LLM' },
  { name: 'phi3', desc: 'Microsoft’s small efficient reasoning model' },
  { name: 'codellama', desc: 'Specialized model trained specifically on code' },
];

export function ModelSelectorModal({
  isOpen,
  onClose,
  models,
  onRefreshModels,
}) {
  const [customModel, setCustomModel] = useState('');
  const [pulling, setPulling] = useState(false);
  const [pullStatus, setPullStatus] = useState('');
  const [pullPercent, setPullPercent] = useState(0);
  const [pullError, setPullError] = useState('');
  const [deletingName, setDeletingName] = useState('');

  if (!isOpen) return null;

  const handleStartPull = (modelName) => {
    const target = modelName || customModel.trim();
    if (!target) return;

    setPulling(true);
    setPullError('');
    setPullStatus(`Initiating download for ${target}...`);
    setPullPercent(0);

    pullModel({
      name: target,
      onProgress: (data) => {
        if (data.status) setPullStatus(data.status);
        if (data.total && data.completed) {
          const pct = Math.round((data.completed / data.total) * 100);
          setPullPercent(pct);
        }
      },
      onFinish: () => {
        setPulling(false);
        setPullStatus(`Successfully downloaded ${target}!`);
        setPullPercent(100);
        setCustomModel('');
        onRefreshModels();
      },
      onError: (err) => {
        setPulling(false);
        setPullError(err.message || 'Failed to download model.');
      }
    });
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Are you sure you want to delete model "${name}" from disk?`)) return;
    setDeletingName(name);
    try {
      await deleteModel(name);
      onRefreshModels();
    } catch (e) {
      alert("Error deleting model: " + e.message);
    } finally {
      setDeletingName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#212121] border border-[#383838] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-[#333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400" size={20} />
            <h2 className="text-lg font-bold text-white">Ollama Model Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-chatgpt-hover"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Pull Custom Model Section */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-chatgpt-textMuted uppercase tracking-wider">
              Download Model from Ollama Library
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. llama3.2, mistral, qwen2.5:1.5b"
                disabled={pulling}
                className="flex-1 bg-chatgpt-card border border-chatgpt-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-chatgpt-textMuted focus:outline-none focus:border-chatgpt-accent"
              />
              <button
                onClick={() => handleStartPull(customModel)}
                disabled={pulling || !customModel.trim()}
                className="px-4 py-2.5 bg-chatgpt-accent hover:bg-chatgpt-accentHover text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {pulling ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Pulling Progress Bar */}
          {pulling && (
            <div className="p-4 bg-[#181818] rounded-xl border border-[#333] space-y-2">
              <div className="flex justify-between text-xs text-gray-300 font-medium">
                <span className="truncate">{pullStatus}</span>
                <span>{pullPercent}%</span>
              </div>
              <div className="w-full bg-[#2a2a2a] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 transition-all duration-300"
                  style={{ width: `${pullPercent}%` }}
                />
              </div>
            </div>
          )}

          {pullError && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{pullError}</span>
            </div>
          )}

          {/* Popular Model Suggestions */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-chatgpt-textMuted uppercase tracking-wider">
              Popular Local Models
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {POPULAR_MODELS.map((pm) => {
                const isInstalled = models.some((m) => m.name.startsWith(pm.name));
                return (
                  <div
                    key={pm.name}
                    className="p-3 bg-[#282828] border border-[#333] rounded-xl flex items-center justify-between hover:border-gray-500 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                        {pm.name}
                        {isInstalled && (
                          <span className="text-[10px] bg-emerald-900/60 text-emerald-400 border border-emerald-700 px-1.5 py-0.2 rounded font-normal">
                            Installed
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{pm.desc}</div>
                    </div>
                    {!isInstalled && (
                      <button
                        onClick={() => handleStartPull(pm.name)}
                        disabled={pulling}
                        className="p-1.5 text-chatgpt-accent hover:bg-chatgpt-accent/20 rounded-lg transition-colors"
                        title={`Pull ${pm.name}`}
                      >
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Installed Models List */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-chatgpt-textMuted uppercase tracking-wider">
              Currently Installed ({models.length})
            </label>
            <div className="space-y-2">
              {models.length === 0 ? (
                <div className="text-xs text-gray-500 py-2">No models downloaded yet.</div>
              ) : (
                models.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between p-3 bg-[#181818] border border-[#2e2e2e] rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">{m.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {(m.size / (1024 * 1024 * 1024)).toFixed(2)} GB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(m.name)}
                      disabled={deletingName === m.name}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete model"
                    >
                      {deletingName === m.name ? (
                        <Loader2 size={16} className="animate-spin text-red-400" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
