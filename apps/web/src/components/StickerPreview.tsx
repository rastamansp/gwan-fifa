import type { StickerResult } from '@gwan-fifa/core';

/**
 * STUB (F00). Implementação real em **F06**:
 * - preview da figurinha (`imageUrl`) + botão Download (URL assinada direta do MinIO)
 * - aviso de validade (`expiresIn`) + "gerar outra"
 */
export interface StickerPreviewProps {
  result: StickerResult;
  onRestart: () => void;
}

export function StickerPreview({ result, onRestart }: StickerPreviewProps) {
  return (
    <section className="sticker-preview">
      {result.imageUrl ? (
        <img src={result.imageUrl} alt="Figurinha gerada" />
      ) : (
        <p className="placeholder">Preview — a implementar (F06).</p>
      )}
      <button type="button" onClick={onRestart}>
        Gerar outra
      </button>
    </section>
  );
}
