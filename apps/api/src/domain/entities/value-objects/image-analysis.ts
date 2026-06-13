import type { ImageAnalysis as ImageAnalysisData } from '@gwan-fifa/core';

/** Re-exporta o tipo do contrato compartilhado. */
export type ImageAnalysis = ImageAnalysisData;

/**
 * Helpers de domínio para `ImageAnalysis`.
 * `fallback()` é usado quando a visão da Claude falha (RN-DOM-03 / REQ-F02-04):
 * a composição segue com defaults seguros e o job ainda conclui.
 */
export const ImageAnalysis = {
  fallback(): ImageAnalysisData {
    return {
      hasFace: false,
      facePosition: { x: 0.5, y: 0.35 },
      dominantBg: '#9fd3d8',
      orientation: 'portrait',
      quality: 'low',
    };
  },
};
