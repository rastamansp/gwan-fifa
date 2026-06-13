import { randomUUID } from 'node:crypto';
import type { JobStatus, StickerData } from '@gwan-fifa/core';
import type { ImageAnalysis } from './value-objects/image-analysis';

/**
 * Aggregate root do domínio. Encapsula as transições válidas de estado
 * (`processing → done` · `processing → error`) — nenhuma outra é permitida.
 */
export class StickerJob {
  private constructor(
    public readonly id: string,
    public status: JobStatus,
    public readonly data: StickerData,
    public uploadKey?: string,
    public resultKey?: string,
    public analysis?: ImageAnalysis,
    public error?: string,
  ) {}

  /** Cria um job novo já em `processing` com id UUID. */
  static create(data: StickerData): StickerJob {
    return new StickerJob(randomUUID(), 'processing', data);
  }

  /** Reidrata a partir de um repositório (ex.: Redis na Fase 2). */
  static rehydrate(props: {
    id: string;
    status: JobStatus;
    data: StickerData;
    uploadKey?: string;
    resultKey?: string;
    analysis?: ImageAnalysis;
    error?: string;
  }): StickerJob {
    return new StickerJob(
      props.id,
      props.status,
      props.data,
      props.uploadKey,
      props.resultKey,
      props.analysis,
      props.error,
    );
  }

  markUploaded(uploadKey: string): void {
    this.uploadKey = uploadKey;
  }

  markDone(resultKey: string, analysis?: ImageAnalysis): void {
    this.assertProcessing();
    this.status = 'done';
    this.resultKey = resultKey;
    this.analysis = analysis;
  }

  markError(reason: string): void {
    this.assertProcessing();
    this.status = 'error';
    this.error = reason;
  }

  private assertProcessing(): void {
    if (this.status !== 'processing') {
      throw new Error(
        `Transição inválida: job ${this.id} já está em '${this.status}'`,
      );
    }
  }
}
