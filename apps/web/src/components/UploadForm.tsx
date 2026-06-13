/**
 * STUB (F00). Implementação real em **F01**:
 * - foto drag-drop + pré-visualização local
 * - campos name (obrigatório) + birthDate/height/weight/club/country
 * - validação client-side (MIME, ≤10MB) + checkbox de consentimento (NFR-PRIV-01)
 * - monta FormData e chama `onSubmit`
 */
export interface UploadFormProps {
  disabled?: boolean;
  onSubmit: (form: FormData) => void;
}

export function UploadForm(_props: UploadFormProps) {
  return (
    <section className="upload-form">
      <p className="placeholder">Formulário de upload — a implementar (F01).</p>
    </section>
  );
}
