import { getAIAvailability, getAISettings, saveAISettings, resetAISettings } from './app.service';
import { ApiClientError } from './apiClient';
import { DecodeError } from './contracts/decode';
import { decodeSettingsResult } from './contracts/ai';

import type { AISettings, AISettingsInput } from '../types/ai';
export type { AISettings, AISettingsInput } from '../types/ai';

declare global {
  interface Window {
    paretoAISettings?: {
      get: () => Promise<unknown>;
      save: (settings: AISettingsInput) => Promise<unknown>;
      reset: () => Promise<unknown>;
    };
  }
}

async function readDesktopSettings(request: Promise<unknown>) {
  let result: unknown;
  try {
    result = await request;
  } catch {
    // Raw IPC exceptions may include main-process details; keep them out of the UI.
    throw new ApiClientError(
      'network_error',
      'Unable to reach desktop AI settings. Please try again.',
    );
  }
  try {
    return decodeSettingsResult(result, '$');
  } catch (error) {
    if (!(error instanceof DecodeError)) throw error;
    throw new ApiClientError(
      'invalid_response',
      'Desktop AI settings returned an invalid response. Reopen Settings before continuing.',
    );
  }
}

export async function updateAISettings(
  port: number,
  operation: 'get' | 'save' | 'reset',
  input?: AISettingsInput,
): Promise<AISettings> {
  // Desktop owns remembered credentials and restores them directly to the backend.
  // The renderer receives availability/settings only, never a remembered API key.
  if (operation === 'save' && !input)
    throw new ApiClientError('invalid_request', 'Enter AI connection settings.');
  if (window.paretoAISettings) {
    const result = await readDesktopSettings(
      operation === 'save'
        ? window.paretoAISettings.save(input!)
        : window.paretoAISettings[operation](),
    );
    if (result.ok === false)
      throw new ApiClientError('http_error', result.error || 'Unable to update AI settings.');
    return result.settings;
  }
  const settings =
    operation === 'get'
      ? await getAISettings(port)
      : operation === 'save'
        ? await saveAISettings(port, input!)
        : await resetAISettings(port);
  return { ...settings, can_remember: false, remembered: false };
}

export async function checkAIAvailability(port: number, signal: AbortSignal): Promise<boolean> {
  if (window.paretoAISettings) {
    const result = await readDesktopSettings(window.paretoAISettings.get());
    if (result.ok === false) {
      if (result.retryable) throw new ApiClientError('network_error', 'AI settings are not ready.');
      return false;
    }
    return result.settings.available;
  }
  return (await getAIAvailability(port, signal)).available;
}
