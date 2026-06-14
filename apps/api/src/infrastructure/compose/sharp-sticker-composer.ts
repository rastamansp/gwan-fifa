import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import type { StickerData } from '@gwan-fifa/core';
import type { IStickerComposerPort } from '../../domain/ports/sticker-composer.port';
import type { ImageAnalysis } from '../../domain/entities/value-objects/image-analysis';

/**
 * F03 — composição da figurinha (PNG 860×1080) no tema "card de copa"
 * verde-amarelo. Espelha o protótipo do frontend
 * (`apps/web/src/lib/compose-sticker.ts`), mas em `sharp` + SVG no servidor.
 *
 * Design ORIGINAL inspirado (NFR-IP-01) — nenhum asset/logo oficial.
 * Todo texto é escapado antes de entrar no SVG (RN-F03-01 / NFR-SEC-03).
 */
@Injectable()
export class SharpStickerComposer implements IStickerComposerPort {
  private readonly W = 860;
  private readonly H = 1080;
  private readonly M = 22; // margem do card
  private readonly R = 46; // raio do card
  private readonly cardW = this.W - this.M * 2; // 816
  private readonly cardH = this.H - this.M * 2; // 1036
  private readonly photoTop = 150;
  private readonly photoH = 620; // até y=770

  private readonly C = {
    greenDeep: '#04261a',
    green: '#0a7d3f',
    greenBr: '#009c3b',
    yellow: '#ffdf00',
    gold: '#f4c430',
    blue: '#1b2f7a',
    ink: '#06281b',
    white: '#ffffff',
  };
  private readonly FONT = "Arial, 'DejaVu Sans', 'Liberation Sans', sans-serif";

  async compose(
    photo: Buffer,
    data: StickerData,
    analysis: ImageAnalysis,
  ): Promise<Buffer> {
    const photoResized = await sharp(photo)
      .resize(this.cardW, this.photoH, {
        fit: 'cover',
        position: analysis.hasFace ? sharp.strategy.attention : 'top',
      })
      .toBuffer();

    const bg = Buffer.from(this.buildBgSvg());
    const fg = Buffer.from(this.buildFgSvg(data));

    return sharp({
      create: {
        width: this.W,
        height: this.H,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        { input: bg, top: 0, left: 0 },
        { input: photoResized, top: this.photoTop, left: this.M },
        { input: fg, top: 0, left: 0 },
      ])
      .png()
      .toBuffer();
  }

  // ---------- camadas ----------

  /** Fundo do card (gradiente verde + swoosh amarelo + raios), recortado ao card. */
  private buildBgSvg(): string {
    const { M, R, cardW, cardH, W, H, C } = this;
    const rays = Array.from({ length: 8 }, (_, k) => {
      const i = k - 2;
      const x1 = M + i * 120 - 80;
      const x2 = M + i * 120 + 220;
      return `<line x1="${x1}" y1="${M}" x2="${x2}" y2="360" stroke="${C.yellow}" stroke-width="26"/>`;
    }).join('');

    const swoosh = [
      [M, H * 0.62],
      [W - M, H * 0.42],
      [W - M, H * 0.56],
      [M, H * 0.76],
    ]
      .map((p) => p.join(','))
      .join(' ');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="base" x1="${M}" y1="${M}" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${C.green}"/>
      <stop offset="0.55" stop-color="#073d24"/>
      <stop offset="1" stop-color="${C.greenDeep}"/>
    </linearGradient>
    <linearGradient id="swoosh" x1="${M}" y1="0" x2="${W - M}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${C.yellow}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${C.yellow}" stop-opacity="0.2"/>
      <stop offset="1" stop-color="${C.yellow}" stop-opacity="0.04"/>
    </linearGradient>
    <clipPath id="card"><rect x="${M}" y="${M}" width="${cardW}" height="${cardH}" rx="${R}"/></clipPath>
  </defs>
  <g clip-path="url(#card)">
    <rect x="${M}" y="${M}" width="${cardW}" height="${cardH}" fill="url(#base)"/>
    <polygon points="${swoosh}" fill="url(#swoosh)"/>
    <g opacity="0.06">${rays}</g>
  </g>
</svg>`;
  }

  /** Sobreposições: fade da foto, header (bandeira+estrelas), faixa do nome, stats, moldura. */
  private buildFgSvg(d: StickerData): string {
    const { M, R, cardW, cardH, W, H, C, FONT, photoTop, photoH } = this;
    const cx = W / 2;
    const photoBottom = photoTop + photoH; // 770

    const ribbonX = 70;
    const ribbonY = 792;
    const ribbonH = 86;
    const ribbonW = W - ribbonX * 2; // 720

    // Stats (apenas campos presentes — RN-F03-02).
    const stats: Array<[string, string]> = [];
    if (d.birthDate) stats.push(['NASC.', d.birthDate]);
    if (d.height) stats.push(['ALTURA', d.height]);
    if (d.weight) stats.push(['PESO', d.weight]);
    const statsSvg = stats
      .map(([label, value], i) => {
        const colW = ribbonW / stats.length;
        const x = ribbonX + colW * i + colW / 2;
        const divider =
          i > 0
            ? `<line x1="${ribbonX + colW * i}" y1="916" x2="${ribbonX + colW * i}" y2="998" stroke="${C.yellow}" stroke-opacity="0.35" stroke-width="2"/>`
            : '';
        return (
          divider +
          `<text x="${x}" y="940" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="24" fill="${C.yellow}">${this.esc(label)}</text>` +
          this.fitText(this.esc(value), x, 986, colW - 28, 40, '800', C.white)
        );
      })
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="${photoBottom - 220}" x2="0" y2="${photoBottom + 30}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#073d24" stop-opacity="0"/>
      <stop offset="1" stop-color="#073d24" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="topshade" x1="0" y1="${photoTop}" x2="0" y2="${photoTop + 130}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${C.greenDeep}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${C.greenDeep}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="ribbon" x1="0" y1="${ribbonY}" x2="0" y2="${ribbonY + ribbonH}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${C.yellow}"/>
      <stop offset="1" stop-color="${C.gold}"/>
    </linearGradient>
    <linearGradient id="border" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${C.gold}"/>
      <stop offset="0.5" stop-color="${C.yellow}"/>
      <stop offset="1" stop-color="${C.gold}"/>
    </linearGradient>
    <clipPath id="cardfg"><rect x="${M}" y="${M}" width="${cardW}" height="${cardH}" rx="${R}"/></clipPath>
  </defs>

  <g clip-path="url(#cardfg)">
    <rect x="${M}" y="${photoBottom - 220}" width="${cardW}" height="250" fill="url(#fade)"/>
    <rect x="${M}" y="${photoTop}" width="${cardW}" height="130" fill="url(#topshade)"/>
  </g>

  ${this.buildFlagBR(56, 52, 124, 84)}
  ${this.buildStars(W - 56, 78, 5, 16)}

  <rect x="${ribbonX}" y="${ribbonY}" width="${ribbonW}" height="${ribbonH}" rx="18" fill="url(#ribbon)"/>
  <rect x="${ribbonX}" y="${ribbonY + ribbonH - 8}" width="${ribbonW}" height="8" fill="${C.greenBr}"/>
  ${this.fitText(this.esc((d.name ?? '').toUpperCase()), cx, ribbonY + 60, ribbonW - 56, 56, '900', C.ink)}

  ${statsSvg}

  <text x="${cx}" y="${H - 34}" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="20" fill="${C.white}" fill-opacity="0.55">gwan.cloud</text>

  <rect x="${M}" y="${M}" width="${cardW}" height="${cardH}" rx="${R}" fill="none" stroke="url(#border)" stroke-width="10"/>
  <rect x="${M + 9}" y="${M + 9}" width="${cardW - 18}" height="${cardH - 18}" rx="${R - 9}" fill="none" stroke="${C.white}" stroke-opacity="0.10" stroke-width="2"/>
</svg>`;
  }

  /** Bandeira do Brasil estilizada (design original, não é o asset oficial). */
  private buildFlagBR(x: number, y: number, w: number, h: number): string {
    const { C } = this;
    const cxF = x + w / 2;
    const cyF = y + h / 2;
    const rhombus = [
      [cxF, y + 12],
      [x + w - 14, cyF],
      [cxF, y + h - 12],
      [x + 14, cyF],
    ]
      .map((p) => p.join(','))
      .join(' ');
    const cr = h * 0.24;
    return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${C.greenBr}"/>
    <polygon points="${rhombus}" fill="${C.yellow}"/>
    <circle cx="${cxF}" cy="${cyF}" r="${cr}" fill="${C.blue}"/>
    <path d="M ${cxF - cr} ${cyF + 2} Q ${cxF} ${cyF - cr * 0.7} ${cxF + cr} ${cyF + 2}" fill="none" stroke="#ffffff" stroke-opacity="0.9" stroke-width="4"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2"/>
  </g>`;
  }

  /** Fila de estrelas (rating decorativo), da direita para a esquerda. */
  private buildStars(rightX: number, cy: number, count: number, size: number): string {
    const gap = size * 2.1;
    const stars = Array.from({ length: count }, (_, i) =>
      this.starPolygon(rightX - i * gap, cy, size),
    ).join('');
    return `<g fill="${this.C.yellow}">${stars}</g>`;
  }

  private starPolygon(cx: number, cy: number, r: number): string {
    const pts: string[] = [];
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI / 2) * 3 + (i * 2 * Math.PI) / 5;
      pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
      const a2 = a + Math.PI / 5;
      pts.push(
        `${(cx + Math.cos(a2) * r * 0.45).toFixed(1)},${(cy + Math.sin(a2) * r * 0.45).toFixed(1)}`,
      );
    }
    return `<polygon points="${pts.join(' ')}"/>`;
  }

  /**
   * Texto centrado com auto-redução: se a largura estimada exceder `maxW`,
   * aplica `textLength` para encolher (librsvg não expõe métricas de fonte).
   */
  private fitText(
    text: string,
    x: number,
    y: number,
    maxW: number,
    size: number,
    weight: string,
    fill: string,
  ): string {
    const estimated = text.length * size * 0.62; // ~0.62em por glifo (Arial bold)
    const len = estimated > maxW ? ` textLength="${maxW}" lengthAdjust="spacingAndGlyphs"` : '';
    return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${this.FONT}" font-weight="${weight}" font-size="${size}" fill="${fill}"${len}>${text}</text>`;
  }

  private esc(s = ''): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
