import { useRef, useState } from 'react';
import type { StickerData } from '@gwan-fifa/core';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB (NFR-SEC-02)
const ACCEPT = ['image/png', 'image/jpeg', 'image/webp'];

export interface UploadFormProps {
  disabled?: boolean;
  onSubmit: (file: File, data: StickerData) => void;
}

interface Fields {
  name: string;
  birthDate: string;
  height: string;
  weight: string;
}

const EMPTY: Fields = {
  name: '',
  birthDate: '',
  height: '',
  weight: '',
};

/**
 * F01 — formulário de upload + dados. Validação client-side (REQ-F01-03):
 * name obrigatório, MIME image/png|jpeg|webp, ≤10 MB; consentimento
 * obrigatório (REQ-F01-04 / NFR-PRIV-01). Pré-visualização local (REQ-F01-06).
 */
export function UploadForm({ disabled, onSubmit }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | undefined): void {
    if (!f) return;
    const next: Record<string, string> = { ...errors };
    delete next.file;
    if (!ACCEPT.includes(f.type)) {
      setErrors({ ...next, file: 'Formato inválido. Use PNG, JPEG ou WebP.' });
      return;
    }
    if (f.size > MAX_BYTES) {
      setErrors({ ...next, file: 'Arquivo muito grande (máx. 10 MB).' });
      return;
    }
    setErrors(next);
    setFile(f);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(f);
    });
  }

  function setField(key: keyof Fields, value: string): void {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!file) e.file = 'Envie uma foto.';
    if (!fields.name.trim()) e.name = 'Informe o nome.';
    if (!consent) e.consent = 'É necessário consentir com o uso da foto.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent): void {
    ev.preventDefault();
    if (disabled || !validate() || !file) return;
    const data: StickerData = {
      name: fields.name.trim(),
      birthDate: fields.birthDate.trim() || undefined,
      height: fields.height.trim() || undefined,
      weight: fields.weight.trim() || undefined,
    };
    onSubmit(file, data);
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit} noValidate>
      {/* Dropzone */}
      <button
        type="button"
        className={`dropzone${dragging ? ' dragging' : ''}${preview ? ' has-image' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pickFile(e.dataTransfer.files?.[0]);
        }}
      >
        {preview ? (
          <img src={preview} alt="Pré-visualização" className="dropzone-preview" />
        ) : (
          <span className="dropzone-hint">
            Arraste uma foto aqui
            <small>ou clique para escolher · PNG, JPEG ou WebP · até 10 MB</small>
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(',')}
          hidden
          onChange={(e) => pickFile(e.target.files?.[0] ?? undefined)}
        />
      </button>
      {errors.file && <p className="field-error">{errors.file}</p>}

      {/* Campos */}
      <label className="field">
        <span>Nome *</span>
        <input
          value={fields.name}
          maxLength={40}
          placeholder="Ex.: Ana Souza"
          onChange={(e) => setField('name', e.target.value)}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </label>

      <label className="field">
        <span>Nascimento</span>
        <input
          value={fields.birthDate}
          placeholder="dd-mm-aaaa"
          onChange={(e) => setField('birthDate', e.target.value)}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Altura</span>
          <input
            value={fields.height}
            placeholder="1,76m"
            onChange={(e) => setField('height', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Peso</span>
          <input
            value={fields.weight}
            placeholder="53 kg"
            onChange={(e) => setField('weight', e.target.value)}
          />
        </label>
      </div>

      <label className="consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>Autorizo o uso da foto para gerar a figurinha.</span>
      </label>
      {errors.consent && <p className="field-error">{errors.consent}</p>}

      <button type="submit" className="btn-primary" disabled={disabled}>
        {disabled ? 'Gerando…' : 'Gerar figurinha'}
      </button>
    </form>
  );
}
