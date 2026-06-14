import type { StickerResult } from '@gwan-fifa/core';

export interface StickerPreviewProps {
  result: StickerResult;
  onRestart: () => void;
}

/**
 * F06 — preview + download + "gerar outra".
 * No mock, `imageUrl` é um data URL (PNG) gerado no client; o download
 * baixa esse PNG. Com o backend, será a URL assinada do MinIO (REQ-F06-03).
 */
export function StickerPreview({ result, onRestart }: StickerPreviewProps) {
  return (
    <section className="sticker-preview">
      {result.imageUrl ? (
        <img
          src={result.imageUrl}
          alt="Figurinha gerada"
          className="sticker-image"
        />
      ) : (
        <p className="placeholder">Sem imagem.</p>
      )}

      <div className="preview-actions">
        {result.imageUrl && (
          <a
            className="btn-primary"
            href={result.imageUrl}
            download={`figurinha-${result.id}.png`}
          >
            Baixar figurinha
          </a>
        )}
        <button type="button" className="btn-ghost" onClick={onRestart}>
          Gerar outra
        </button>
      </div>

      <p className="mock-note">
        Gerada no servidor (composição <code>sharp</code> + MinIO). O link de
        download é temporário.
      </p>
    </section>
  );
}
