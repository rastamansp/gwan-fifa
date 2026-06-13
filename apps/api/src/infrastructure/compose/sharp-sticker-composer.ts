import { Injectable, NotImplementedException } from '@nestjs/common';
import type { StickerData } from '@gwan-fifa/core';
import type { IStickerComposerPort } from '../../domain/ports/sticker-composer.port';
import type { ImageAnalysis } from '../../domain/entities/value-objects/image-analysis';

/**
 * STUB (F00). Implementação real em **F03** (`sharp` + overlay SVG → PNG 860×1080).
 * Template é design ORIGINAL inspirado (NFR-IP-01) — nunca assets oficiais.
 * Todo texto no SVG deve ser escapado (RN-DOM-02 / NFR-SEC-03).
 */
@Injectable()
export class SharpStickerComposer implements IStickerComposerPort {
  async compose(
    _photo: Buffer,
    _data: StickerData,
    _analysis: ImageAnalysis,
  ): Promise<Buffer> {
    throw new NotImplementedException(
      'SharpStickerComposer.compose — implementar em F03',
    );
  }
}
