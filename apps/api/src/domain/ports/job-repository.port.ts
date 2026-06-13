import type { StickerJob } from '../entities/sticker-job.entity';

export const JOB_REPOSITORY_PORT = Symbol('IJobRepositoryPort');

/** Persistência do estado dos jobs (em memória no MVP; Redis na Fase 2). */
export interface IJobRepositoryPort {
  save(job: StickerJob): Promise<void>;
  find(id: string): Promise<StickerJob | null>;
}
