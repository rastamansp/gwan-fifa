import { z } from 'zod';

/**
 * Dados do formulário que viram texto na figurinha.
 * Apenas `name` é obrigatório (RN-DOM-01). Demais campos são opcionais
 * e omitidos do layout quando ausentes (RN-F03-02).
 *
 * Produto Brasil-only: não há clube/país (a figurinha sempre usa o tema
 * verde-amarelo + bandeira BR).
 */
export const StickerDataSchema = z.object({
  name: z.string().min(1).max(40),
  birthDate: z
    .string()
    .regex(/^\d{2}-\d{2}-\d{4}$/, 'birthDate deve ser dd-mm-aaaa')
    .optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
});

export type StickerData = z.infer<typeof StickerDataSchema>;
