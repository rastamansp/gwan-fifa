import type { GenerateResponse, StickerResult } from '@gwan-fifa/core';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

/** `POST /api/generate` — envia foto + dados, recebe `{ id, status }`. */
export async function generate(form: FormData): Promise<GenerateResponse> {
  const res = await fetch(`${BASE}/api/generate`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`generate failed: ${res.status}`);
  return res.json();
}

/** `GET /api/result/:id` — consulta o status do job. */
export async function poll(id: string): Promise<StickerResult> {
  const res = await fetch(`${BASE}/api/result/${id}`);
  if (!res.ok) throw new Error(`result failed: ${res.status}`);
  return res.json();
}
