/**
 * Ollama API Client Service
 * Interacts with Ollama local instance on port 11434 via Vite proxy (/api)
 * or directly to fallback URL.
 */

const BASE_URL = '/api';

/**
 * Fetch available installed models from Ollama
 */
export async function getModels() {
  try {
    const response = await fetch(`${BASE_URL}/tags`);
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error("Failed to fetch Ollama models:", error);
    throw error;
  }
}

/**
 * Stream chat completion from Ollama using NDJSON stream reader
 */
export async function streamChatCompletion({
  model,
  messages,
  systemPrompt = '',
  temperature = 0.7,
  onChunk,
  onFinish,
  onError,
  signal,
}) {
  try {
    const formattedMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const payload = {
      model,
      messages: formattedMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
      options: {
        temperature: parseFloat(temperature),
      }
    };

    const response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama Error (${response.status}): ${errorText || response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    let evalCount = 0;
    let evalDuration = 0;
    let promptEvalDuration = 0;

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line);
          if (chunk.message?.content) {
            fullContent += chunk.message.content;
            if (onChunk) {
              onChunk(chunk.message.content, fullContent);
            }
          }
          if (chunk.done) {
            evalCount = chunk.eval_count || 0;
            evalDuration = chunk.eval_duration || 0;
            promptEvalDuration = chunk.prompt_eval_duration || 0;
          }
        } catch (e) {
          console.warn("Failed to parse NDJSON chunk:", line, e);
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      try {
        const chunk = JSON.parse(buffer);
        if (chunk.message?.content) {
          fullContent += chunk.message.content;
          if (onChunk) onChunk(chunk.message.content, fullContent);
        }
      } catch (e) {
        // ignore incomplete line
      }
    }

    const stats = {
      evalCount,
      evalDuration, // nanoseconds
      promptEvalDuration,
      tokensPerSec: evalDuration ? ((evalCount / (evalDuration / 1e9))).toFixed(1) : 0,
    };

    if (onFinish) {
      onFinish(fullContent, stats);
    }
    return { fullContent, stats };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Stream aborted by user');
      return;
    }
    console.error('Error streaming from Ollama:', error);
    if (onError) onError(error);
    throw error;
  }
}

/**
 * Pull a model from Ollama library with streaming progress
 */
export async function pullModel({ name, onProgress, onFinish, onError }) {
  try {
    const response = await fetch(`${BASE_URL}/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const statusObj = JSON.parse(line);
          if (onProgress) onProgress(statusObj);
        } catch (e) {
          console.warn("Error parsing pull progress:", line);
        }
      }
    }

    if (onFinish) onFinish();
  } catch (err) {
    console.error("Error pulling model:", err);
    if (onError) onError(err);
  }
}

/**
 * Delete a model from Ollama local storage
 */
export async function deleteModel(name) {
  const response = await fetch(`${BASE_URL}/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete model ${name}`);
  }
  return true;
}
