import { UploadForm } from './components/UploadForm';
import { StickerPreview } from './components/StickerPreview';
import { GwanFooter } from './components/GwanFooter';
import { useGenerateSticker } from './hooks/useGenerateSticker';

/** Página única: orquestra o fluxo upload → processing → done/error (F01/F06). */
export function App() {
  const { state, result, error, submit, reset } = useGenerateSticker();
  const busy = state === 'uploading' || state === 'processing';

  return (
    <div className="app">
      <header className="app-header">
        <h1>Gwan FIFA</h1>
        <p>Gere sua figurinha estilo álbum esportivo.</p>
      </header>

      <main className="app-main">
        {state === 'done' && result ? (
          <StickerPreview result={result} onRestart={reset} />
        ) : (
          <>
            <UploadForm disabled={busy} onSubmit={submit} />
            {busy && <p className="status">Processando…</p>}
            {state === 'error' && (
              <div className="status status-error">
                <p>{error}</p>
                <button type="button" onClick={reset}>
                  Tentar de novo
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <GwanFooter />
    </div>
  );
}
