import { Inject, Injectable, Logger } from '@nestjs/common';
import type { GenerateResponse, StickerData } from '@gwan-fifa/core';
import { StickerJob } from '../../domain/entities/sticker-job.entity';
import { ImageAnalysis } from '../../domain/entities/value-objects/image-analysis';
import {
  IMAGE_ANALYSIS_PORT,
  type IImageAnalysisPort,
} from '../../domain/ports/image-analysis.port';
import {
  STICKER_COMPOSER_PORT,
  type IStickerComposerPort,
} from '../../domain/ports/sticker-composer.port';
import {
  OBJECT_STORAGE_PORT,
  type IObjectStoragePort,
} from '../../domain/ports/object-storage.port';
import {
  JOB_REPOSITORY_PORT,
  type IJobRepositoryPort,
} from '../../domain/ports/job-repository.port';

@Injectable()
export class GenerateStickerUseCase {
  private readonly logger = new Logger(GenerateStickerUseCase.name);

  constructor(
    @Inject(IMAGE_ANALYSIS_PORT) private readonly analysis: IImageAnalysisPort,
    @Inject(STICKER_COMPOSER_PORT) private readonly composer: IStickerComposerPort,
    @Inject(OBJECT_STORAGE_PORT) private readonly storage: IObjectStoragePort,
    @Inject(JOB_REPOSITORY_PORT) private readonly jobs: IJobRepositoryPort,
  ) {}

  /** Cria o job e dispara o processamento assíncrono (não bloqueia a resposta HTTP). */
  async execute(
    photo: Buffer,
    mime: string,
    data: StickerData,
  ): Promise<GenerateResponse> {
    const job = StickerJob.create(data);
    await this.jobs.save(job);
    // fire-and-forget no MVP (ADR-02); Fase 2 = BullMQ.
    void this.process(job, photo, mime);
    return { id: job.id, status: job.status };
  }

  private async process(
    job: StickerJob,
    photo: Buffer,
    mime: string,
  ): Promise<void> {
    try {
      const uploadKey = `uploads/${job.id}`;
      await this.storage.put(uploadKey, photo, mime);
      job.markUploaded(uploadKey);

      // Análise é best-effort: falha cai para defaults (RN-DOM-03 / RN-F02-03).
      const analysis = await this.analysis
        .analyze(photo, mime)
        .catch((e) => {
          this.logger.warn(`[${job.id}] análise Claude falhou: ${e}`);
          return ImageAnalysis.fallback();
        });

      const out = await this.composer.compose(photo, job.data, analysis);
      const resultKey = `results/${job.id}.png`;
      await this.storage.put(resultKey, out, 'image/png');

      job.markDone(resultKey, analysis);
      await this.jobs.save(job);
      this.logger.log(`[${job.id}] figurinha pronta -> ${resultKey}`);
    } catch (e) {
      job.markError(String(e));
      await this.jobs.save(job);
      this.logger.error(`[${job.id}] falha na geração: ${e}`);
    }
  }
}
