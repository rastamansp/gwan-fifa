import type { StickerData } from '@gwan-fifa/core';
import type { ImageAnalysis } from '../entities/value-objects/image-analysis';

export const STICKER_COMPOSER_PORT = Symbol('IStickerComposerPort');

/** Compõe a figurinha final (PNG 860×1080) a partir da foto + dados + análise. */
export interface IStickerComposerPort {
  compose(
    photo: Buffer,
    data: StickerData,
    analysis: ImageAnalysis,
  ): Promise<Buffer>;
}
