import { Module } from '@nestjs/common';
import { IMAGE_ANALYSIS_PORT } from '../domain/ports/image-analysis.port';
import { STICKER_COMPOSER_PORT } from '../domain/ports/sticker-composer.port';
import { OBJECT_STORAGE_PORT } from '../domain/ports/object-storage.port';
import { JOB_REPOSITORY_PORT } from '../domain/ports/job-repository.port';
import { ClaudeImageAnalysisAdapter } from './claude/claude-image-analysis.adapter';
import { SharpStickerComposer } from './compose/sharp-sticker-composer';
import { MinioStorageAdapter } from './storage/minio-storage.adapter';
import { InMemoryJobRepository } from './jobs/in-memory-job.repository';

/** Liga os tokens dos ports aos adapters concretos (Ports & Adapters). */
@Module({
  providers: [
    { provide: IMAGE_ANALYSIS_PORT, useClass: ClaudeImageAnalysisAdapter },
    { provide: STICKER_COMPOSER_PORT, useClass: SharpStickerComposer },
    { provide: OBJECT_STORAGE_PORT, useClass: MinioStorageAdapter },
    // Fase 2: trocar por RedisJobRepository (F08) sem tocar nos use cases.
    { provide: JOB_REPOSITORY_PORT, useClass: InMemoryJobRepository },
  ],
  exports: [
    IMAGE_ANALYSIS_PORT,
    STICKER_COMPOSER_PORT,
    OBJECT_STORAGE_PORT,
    JOB_REPOSITORY_PORT,
  ],
})
export class InfrastructureModule {}
