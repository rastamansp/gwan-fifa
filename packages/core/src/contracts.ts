/** Estado de um job de geração de figurinha. */
export type JobStatus = 'processing' | 'done' | 'error';

/** Resposta de `POST /api/generate` (202). */
export interface GenerateResponse {
  id: string;
  status: JobStatus;
}

/** Resposta de `GET /api/result/:id`. */
export interface StickerResult {
  id: string;
  status: JobStatus;
  /** URL assinada do MinIO quando `status = done`. */
  imageUrl?: string;
  /** Validade da URL assinada em segundos. */
  expiresIn?: number;
  /** Mensagem quando `status = error`. */
  error?: string;
}

/** Metadados de visão devolvidos pela Claude (F02). */
export interface ImageAnalysis {
  hasFace: boolean;
  facePosition: { x: number; y: number };
  /** Cor de fundo da figurinha (#hex). Fallback `#9fd3d8`. */
  dominantBg: string;
  orientation: 'portrait' | 'landscape';
  quality: 'low' | 'ok' | 'high';
}
