import { Injectable, NotImplementedException } from '@nestjs/common';
import type { IImageAnalysisPort } from '../../domain/ports/image-analysis.port';
import type { ImageAnalysis } from '../../domain/entities/value-objects/image-analysis';

/**
 * STUB (F00). Implementação real em **F02** (Claude visão → JSON `ImageAnalysis`).
 * `ANTHROPIC_API_KEY` só no backend (NFR-SEC-01). Claude NÃO gera imagem (RN-F02-01).
 */
@Injectable()
export class ClaudeImageAnalysisAdapter implements IImageAnalysisPort {
  async analyze(_image: Buffer, _mediaType: string): Promise<ImageAnalysis> {
    throw new NotImplementedException(
      'ClaudeImageAnalysisAdapter.analyze — implementar em F02',
    );
  }
}
