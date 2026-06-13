import type { ImageAnalysis } from '../entities/value-objects/image-analysis';

export const IMAGE_ANALYSIS_PORT = Symbol('IImageAnalysisPort');

/** Visão/interpretação da foto (Claude no MVP). Não gera imagem. */
export interface IImageAnalysisPort {
  analyze(image: Buffer, mediaType: string): Promise<ImageAnalysis>;
}
