import { useEffect, useRef, useState } from 'react';
import type { StickerData } from '@gwan-fifa/core';
import { composeSticker } from '../lib/compose-sticker';

const DEMO_PHOTO = '/demo-foto.jpg';

/** Dados de exemplo usados no tutorial (texto de demonstração). */
const DEMO_DATA: StickerData = {
  name: 'Maurício',
  birthDate: '19-09-1986',
  height: '1,75m',
  weight: '74 kg',
};

interface Step {
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: '1. Envie sua foto',
    body: 'Arraste ou escolha uma foto de rosto (PNG, JPEG ou WebP, até 10 MB) e marque o consentimento de uso.',
  },
  {
    title: '2. Preencha seus dados',
    body: 'Informe o nome (obrigatório) e, se quiser, nascimento, altura e peso. Eles aparecem na figurinha.',
  },
  {
    title: '3. Geramos a figurinha',
    body: 'A foto é analisada e composta no estilo de card de copa — verde e amarelo. Leva poucos segundos.',
  },
  {
    title: '4. Baixe e compartilhe',
    body: 'Pronto! Visualize, baixe o PNG e gere quantas quiser. É assim que sua figurinha fica:',
  },
];

export interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

export function DemoModal({ open, onClose }: DemoModalProps) {
  const [screen, setScreen] = useState<'intro' | 'tour'>('intro');
  const [step, setStep] = useState(0);
  const [sticker, setSticker] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const started = useRef(false);

  // Sempre reinicia na primeira etapa ao (re)abrir o modal.
  useEffect(() => {
    if (open) {
      setScreen('intro');
      setStep(0);
    }
  }, [open]);

  // Gera a figurinha de exemplo (uma vez) assim que o tour começa.
  useEffect(() => {
    if (screen !== 'tour' || started.current) return;
    started.current = true;
    setComposing(true);
    (async () => {
      try {
        const res = await fetch(DEMO_PHOTO);
        const blob = await res.blob();
        const file = new File([blob], 'demo-foto.jpg', {
          type: blob.type || 'image/jpeg',
        });
        setSticker(await composeSticker(file, DEMO_DATA));
      } catch {
        /* demo é best-effort: se falhar, o passo 4 mostra um aviso */
      } finally {
        setComposing(false);
      }
    })();
  }, [screen]);

  if (!open) return null;

  const startTour = () => {
    setStep(0);
    setScreen('tour');
  };

  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Demonstração"
      onClick={onClose}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" aria-label="Fechar" onClick={onClose}>
          ×
        </button>

        {screen === 'intro' ? (
          <div className="demo-intro">
            <span className="demo-kicker">Bem-vindo ao Gwan FIFA</span>
            <h2>Quer ver como funciona?</h2>
            <p>
              Em poucos segundos você transforma uma foto numa figurinha estilo
              copa. Veja a demonstração passo a passo.
            </p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={startTour}>
                Ver demonstração
              </button>
              <button className="btn-ghost" onClick={onClose}>
                Agora não
              </button>
            </div>
          </div>
        ) : (
          <div className="demo-tour">
            <div className="demo-progress">
              {STEPS.map((_, i) => (
                <span key={i} className={`dot${i === step ? ' active' : ''}`} />
              ))}
            </div>

            <div className="demo-stage">
              <DemoVisual
                step={step}
                sticker={sticker}
                composing={composing}
              />
            </div>

            <div className="demo-text">
              <h3>{STEPS[step].title}</h3>
              <p>{STEPS[step].body}</p>
            </div>

            <div className="modal-actions">
              <button
                className="btn-ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                Anterior
              </button>
              {isLast ? (
                <button className="btn-primary" onClick={onClose}>
                  Começar agora
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                >
                  Próximo
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DemoVisual({
  step,
  sticker,
  composing,
}: {
  step: number;
  sticker: string | null;
  composing: boolean;
}) {
  if (step === 0) {
    return (
      <div className="demo-photo-frame">
        <img src={DEMO_PHOTO} alt="Foto de exemplo" />
      </div>
    );
  }
  if (step === 1) {
    return (
      <ul className="demo-fields">
        <li>
          <span>Nome</span>
          <strong>{DEMO_DATA.name}</strong>
        </li>
        <li>
          <span>Nascimento</span>
          <strong>{DEMO_DATA.birthDate}</strong>
        </li>
        <li>
          <span>Altura</span>
          <strong>{DEMO_DATA.height}</strong>
        </li>
        <li>
          <span>Peso</span>
          <strong>{DEMO_DATA.weight}</strong>
        </li>
      </ul>
    );
  }
  if (step === 2) {
    return (
      <div className="demo-loading">
        <div className="spinner" />
        <span>Compondo a figurinha…</span>
      </div>
    );
  }
  // step 3 — resultado
  if (composing && !sticker) {
    return (
      <div className="demo-loading">
        <div className="spinner" />
        <span>Quase lá…</span>
      </div>
    );
  }
  return sticker ? (
    <img src={sticker} alt="Figurinha de exemplo" className="demo-sticker" />
  ) : (
    <p className="placeholder">Não foi possível gerar o exemplo agora.</p>
  );
}
