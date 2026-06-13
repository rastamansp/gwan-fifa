import { useCallback, useRef, useState } from 'react';
import type { StickerResult } from '@gwan-fifa/core';
import { generate, poll } from '../api/client';

export type FlowState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

const POLL_INTERVAL_MS = 1000;
const MAX_ATTEMPTS = 30;

/**
 * Estado do fluxo: idle → uploading → processing → done/error (F01/F06).
 * Faz polling de `GET /api/result/:id` até `done`/`error` (REQ-F06-01).
 */
export function useGenerateSticker() {
  const [state, setState] = useState<FlowState>('idle');
  const [result, setResult] = useState<StickerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancelled = useRef(false);

  const reset = useCallback(() => {
    cancelled.current = true;
    setState('idle');
    setResult(null);
    setError(null);
  }, []);

  const submit = useCallback(async (form: FormData) => {
    cancelled.current = false;
    setError(null);
    setResult(null);
    setState('uploading');
    try {
      const { id } = await generate(form);
      setState('processing');

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (cancelled.current) return;
        const r = await poll(id);
        if (r.status === 'done') {
          setResult(r);
          setState('done');
          return;
        }
        if (r.status === 'error') {
          setError(r.error ?? 'Falha ao gerar a figurinha.');
          setState('error');
          return;
        }
        await new Promise((res) => setTimeout(res, POLL_INTERVAL_MS));
      }
      setError('Tempo esgotado. Tente novamente.'); // RN-F06-02
      setState('error');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState('error');
    }
  }, []);

  return { state, result, error, submit, reset };
}
