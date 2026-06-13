import { Injectable } from '@nestjs/common';
import type { IJobRepositoryPort } from '../../domain/ports/job-repository.port';
import type { StickerJob } from '../../domain/entities/sticker-job.entity';

/**
 * Repositório em memória (MVP). Perde estado em restart e não escala
 * horizontalmente (NFR-SCALE-01 / ADR-02). Fase 2 → `RedisJobRepository`
 * trocando só este provider, sem tocar nos use cases.
 */
@Injectable()
export class InMemoryJobRepository implements IJobRepositoryPort {
  private readonly store = new Map<string, StickerJob>();

  async save(job: StickerJob): Promise<void> {
    this.store.set(job.id, job);
  }

  async find(id: string): Promise<StickerJob | null> {
    return this.store.get(id) ?? null;
  }
}
