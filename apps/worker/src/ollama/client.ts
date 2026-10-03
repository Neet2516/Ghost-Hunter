import { AIDraftOutput } from '@ghost-hunter/shared';
import { validateAndParseDraft } from './prompt.js';

export interface OllamaClientConfig {
  baseUrl?: string;
  model?: string;
  temperature?: number;
  timeoutMs?: number;
}

export interface ModelHealthResult {
  status: 'healthy' | 'offline' | 'missing_model';
  model?: string;
  error?: string;
}

export class OllamaClient {
  readonly baseUrl: string;
  readonly model: string;
  readonly temperature: number;
  readonly timeoutMs: number;

  constructor(config?: OllamaClientConfig) {
    this.baseUrl = (config?.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
    this.model = config?.model || process.env.OLLAMA_MODEL || 'gemma3:4b';
    // Per spec: temperature must be <= 0.4
    this.temperature = Math.min(config?.temperature ?? 0.3, 0.4);
    // Per spec: timeout 90s default
    this.timeoutMs = config?.timeoutMs ?? 90_000;
  }

  /**
   * Checks whether Ollama is reachable and whether the target model is installed.
   */
  async checkHealth(): Promise<ModelHealthResult> {
    const url = `${this.baseUrl}/api/tags`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5_000),
      });

      if (!response.ok) {
        return {
          status: 'offline',
          error: `Ollama service returned HTTP status ${response.status}`,
        };
      }

      const data = (await response.json()) as { models?: Array<{ name?: string; model?: string }> };
      const modelList = data.models || [];

      const modelNormalized = this.model.toLowerCase();
      const modelPrefix = modelNormalized.split(':')[0];

      const found = modelList.some((m) => {
        const name = (m.name || m.model || '').toLowerCase();
        return name === modelNormalized || name === `${modelPrefix}:latest` || name.startsWith(`${modelPrefix}:`);
      });

      if (!found) {
        return {
          status: 'missing_model',
          model: this.model,
          error: `Model "${this.model}" is not installed. Run 'ollama pull ${this.model}' to download it.`,
        };
      }

      return {
        status: 'healthy',
        model: this.model,
      };
    } catch (err) {
      return {
        status: 'offline',
        error: `Ollama is unreachable at ${this.baseUrl}: ${(err as Error).message}`,
      };
    }
  }

  /**
   * Sends prompt to Ollama /api/chat with format: "json" and validates output.
   */
  async generateDraft(prompt: { system: string; user: string }): Promise<AIDraftOutput> {
    const url = `${this.baseUrl}/api/chat`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
          ],
          stream: false,
          format: 'json',
          options: {
            temperature: this.temperature,
          },
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err) {
      throw new Error(`Failed to connect to Ollama at ${this.baseUrl}: ${(err as Error).message}`);
    }

    if (response.status === 404) {
      throw new Error(`Model "${this.model}" not found (404) on Ollama instance`);
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Ollama request failed with HTTP ${response.status}: ${errText || response.statusText}`);
    }

    const data = (await response.json()) as {
      message?: { content?: string };
    };

    const rawContent = data.message?.content;
    if (!rawContent) {
      throw new Error('Ollama returned empty response message content');
    }

    return validateAndParseDraft(rawContent);
  }
}
