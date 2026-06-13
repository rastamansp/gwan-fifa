import { Inject, Injectable } from '@nestjs/common';
import type { StickerResult } from '@gwan-fifa/core';
import {
  JOB_REPOSITORY_PORT,
  type IJobRepositoryPort,
} from '../../domain/ports/job-repository.port';
import {
  OBJECT_STORAGE_PORT,
  type IObjectStoragePort,
} from '../../domain/ports/object-storage.port';

@Injectable()
export class GetStickerResultUseCase {
  constructor(
    @Inject(JOB_REPOSITORY_PORT) private readonly jobs: IJobRepositoryPort,
    @Inject(OBJECT_STORAGE_PORT) private readonly storage: IObjectStoragePort,
  ) {}

  async execute(id: string): Promise<StickerResult> {
    const job = await this.jobs.find(id);
    if (!job) return { id, status: 'error', error: 'not found' };
    if (job.status !== 'done') {
      return { id, status: job.status, error: job.error };
    }

    const ttl = Number(process.env.SIGNED_URL_TTL ?? 3600);
    const imageUrl = await this.storage.signedUrl(job.resultKey!, ttl);
    return { id, status: 'done', imageUrl, expiresIn: ttl };
  }
}
