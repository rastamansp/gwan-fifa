import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import type { IImageAnalysisPort } from '../../domain/ports/image-analysis.port';
import type { ImageAnalysis } from '../../domain/entities/value-objects/image-analysis';

type ClaudeMedia = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

/**
 * F02 — visão da Claude: interpreta a foto e devolve `ImageAnalysis` (JSON).
 * Claude NÃO gera imagem (RN-F02-01); a foto é reutilizada na composição.
 * `ANTHROPIC_API_KEY` só no backend (RN-F02-02). Falha/JSON inválido →
 * o use case cai para `ImageAnalysis.fallback()` (RN-F02-03 / REQ-F02-04).
 */
@Injectable()
export class ClaudeImageAnalysisAdapter implements IImageAnalysisPort {
  private _client?: Anthropic;

  private client(): Anthropic {
    if (!this._client) {
      this._client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return this._client;
  }

  async analyze(image: Buffer, mediaType: string): Promise<ImageAnalysis> {
    const res = await this.client().messages.create({
      model: process.env.CLAUDE_MODEL ?? 'claude-opus-4-8',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: this.normalizeMedia(mediaType),
                data: image.toString('base64'),
              },
            },
            {
              type: 'text',
              text:
                'Analise a foto. Retorne SOMENTE JSON, sem markdown: ' +
                '{"hasFace":bool,"facePosition":{"x":0-1,"y":0-1},"dominantBg":"#hex",' +
                '"orientation":"portrait|landscape","quality":"low|ok|high"}',
            },
          ],
        },
      ],
    });

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    // Parsing tolerante: remove cercas markdown e espaços (REQ-F02-03).
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as ImageAnalysis;
  }

  private normalizeMedia(mime: string): ClaudeMedia {
    const m = mime.toLowerCase();
    if (m === 'image/png') return 'image/png';
    if (m === 'image/webp') return 'image/webp';
    if (m === 'image/gif') return 'image/gif';
    return 'image/jpeg';
  }
}
