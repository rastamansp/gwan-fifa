import { useCallback, useState } from 'react';
import type { StickerData, StickerResult } from '@gwan-fifa/core';
import { composeSticker } from '../lib/compose-sticker';

export type FlowState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

/**
 * MOCK do fluxo de geração (sem backend), para iterar a UI e o SDD.
 * idle → uploading → processing → done/error.
 *
 * Compõe a figurinha no client (canvas). Quando o backend MVP existir,
 * troca-se este corpo por `generate()` + polling de `poll()` em `api/client.ts`,
 * mantendo a mesma interface do hook.
 */
export function useGenerateSticker() {
  const [state, setState] = useState<FlowState>('idle');
  const [result, setResult] = useState<StickerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
  }, []);

  const submit = useCallback(async (file: File, data: StickerData) => {
    setError(null);
    setResult(null);
    setState('uploading');
    try {
      // Simula latência de upload + análise (NFR-PERF-01 alvo ≤10s).
      await delay(450);
      setState('processing');
      await delay(900);

      const imageUrl = await composeSticker(file, data);
      setResult({ id: mockId(), status: 'done', imageUrl });
      setState('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState('error');
    }
  }, []);

  return { state, result, error, submit, reset };
}

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

function mockId(): string {
  return `mock-${Math.random().toString(36).slice(2, 10)}`;
}
