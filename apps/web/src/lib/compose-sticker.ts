import type { StickerData } from '@gwan-fifa/core';

/**
 * MOCK da composição (F03) no client com <canvas>, para prototipar a figurinha
 * e iterar o SDD sem backend. PNG 860×1080 (RN-DOM-05), tema "copa" verde-amarelo.
 *
 * Design ORIGINAL inspirado no estilo de card de álbum esportivo (NFR-IP-01) —
 * nenhum asset/logo oficial. A composição real virá do `sharp` no backend.
 */
export const STICKER_W = 860;
export const STICKER_H = 1080;

// Paleta Brasil (verde-amarelo) — tasteful.
const C = {
  greenDeep: '#04261a',
  green: '#0a7d3f',
  greenBr: '#009c3b',
  yellow: '#ffdf00',
  gold: '#f4c430',
  blue: '#1b2f7a',
  ink: '#06281b',
  white: '#ffffff',
};

export interface ComposeOptions {
  /** Reservado (mock do `analysis.dominantBg`); o chrome usa a paleta da copa. */
  bg?: string;
}

export async function composeSticker(
  photoFile: File,
  data: StickerData,
  _opts: ComposeOptions = {},
): Promise<string> {
  const img = await loadImage(photoFile);

  const canvas = document.createElement('canvas');
  canvas.width = STICKER_W;
  canvas.height = STICKER_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D não suportado neste navegador.');

  const M = 22; // margem do card
  const R = 46; // raio do card
  const cardW = STICKER_W - M * 2;
  const cardH = STICKER_H - M * 2;
  const cx = STICKER_W / 2;

  // Sombra externa do card.
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  roundRect(ctx, M, M, cardW, cardH, R);
  ctx.fillStyle = C.greenDeep;
  ctx.fill();
  ctx.restore();

  // Conteúdo recortado ao card.
  ctx.save();
  roundRect(ctx, M, M, cardW, cardH, R);
  ctx.clip();

  // Fundo base (gradiente verde profundo → verde).
  const base = ctx.createLinearGradient(0, M, STICKER_W, STICKER_H);
  base.addColorStop(0, C.green);
  base.addColorStop(0.55, '#073d24');
  base.addColorStop(1, C.greenDeep);
  ctx.fillStyle = base;
  ctx.fillRect(M, M, cardW, cardH);

  // Swoosh diagonal amarelo translúcido (dinamismo).
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(M, STICKER_H * 0.62);
  ctx.lineTo(STICKER_W - M, STICKER_H * 0.42);
  ctx.lineTo(STICKER_W - M, STICKER_H * 0.56);
  ctx.lineTo(M, STICKER_H * 0.76);
  ctx.closePath();
  const swoosh = ctx.createLinearGradient(M, 0, STICKER_W - M, 0);
  swoosh.addColorStop(0, 'rgba(255,223,0,0.0)');
  swoosh.addColorStop(0.5, 'rgba(255,223,0,0.20)');
  swoosh.addColorStop(1, 'rgba(255,223,0,0.04)');
  ctx.fillStyle = swoosh;
  ctx.fill();
  ctx.restore();

  // Raios diagonais sutis no topo.
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = C.yellow;
  ctx.lineWidth = 26;
  for (let i = -2; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(M + i * 120 - 80, M);
    ctx.lineTo(M + i * 120 + 220, 360);
    ctx.stroke();
  }
  ctx.restore();

  // ----- Foto -----
  const photoTop = 150;
  const photoBottom = 770;
  drawCover(ctx, img, M, photoTop, cardW, photoBottom - photoTop, 0.5, 0.16);

  // Fade da foto para o card (funde a base da foto).
  const fade = ctx.createLinearGradient(0, photoBottom - 220, 0, photoBottom + 30);
  fade.addColorStop(0, 'rgba(7,61,36,0)');
  fade.addColorStop(1, '#073d24');
  ctx.fillStyle = fade;
  ctx.fillRect(M, photoBottom - 220, cardW, 250);

  // Topo escurecido p/ legibilidade do header.
  const topShade = ctx.createLinearGradient(0, photoTop, 0, photoTop + 130);
  topShade.addColorStop(0, 'rgba(4,38,26,0.55)');
  topShade.addColorStop(1, 'rgba(4,38,26,0)');
  ctx.fillStyle = topShade;
  ctx.fillRect(M, photoTop, cardW, 130);

  // ----- Header: bandeira + estrelas -----
  drawFlagBR(ctx, 56, 52, 124, 84);
  drawStars(ctx, STICKER_W - 56, 78, 5, 16);

  // ----- Faixa do nome (amarela) -----
  const ribbonY = 792;
  const ribbonH = 86;
  const ribbonX = 70;
  const ribbonW = STICKER_W - ribbonX * 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  roundRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 18);
  const rib = ctx.createLinearGradient(0, ribbonY, 0, ribbonY + ribbonH);
  rib.addColorStop(0, C.yellow);
  rib.addColorStop(1, C.gold);
  ctx.fillStyle = rib;
  ctx.fill();
  ctx.restore();
  // detalhe verde nas pontas da faixa
  ctx.fillStyle = C.greenBr;
  ctx.fillRect(ribbonX, ribbonY + ribbonH - 8, ribbonW, 8);

  ctx.textAlign = 'center';
  ctx.fillStyle = C.ink;
  fitFont(ctx, (data.name || '').toUpperCase(), ribbonW - 56, 56, 30, '900', '"Arial Black", Arial, sans-serif');
  ctx.fillText((data.name || '').toUpperCase(), cx, ribbonY + 60);

  // ----- Stats -----
  const stats: Array<[string, string]> = [];
  if (data.birthDate) stats.push(['NASC.', data.birthDate]);
  if (data.height) stats.push(['ALTURA', data.height]);
  if (data.weight) stats.push(['PESO', data.weight]);

  if (stats.length) {
    const colW = ribbonW / stats.length;
    const labelY = 940;
    const valueY = 986;
    stats.forEach(([label, value], i) => {
      const colX = ribbonX + colW * i + colW / 2;
      if (i > 0) {
        ctx.strokeStyle = 'rgba(255,223,0,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ribbonX + colW * i, 916);
        ctx.lineTo(ribbonX + colW * i, 998);
        ctx.stroke();
      }
      ctx.fillStyle = C.yellow;
      ctx.font = '800 24px Arial, sans-serif';
      ctx.fillText(label, colX, labelY);
      ctx.fillStyle = C.white;
      fitFont(ctx, value, colW - 28, 40, 22, '800', 'Arial, sans-serif');
      ctx.fillText(value, colX, valueY);
    });
  }

  // Branding gwan.cloud.
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '600 20px Arial, sans-serif';
  ctx.fillText('gwan.cloud', cx, STICKER_H - 34);

  ctx.restore(); // fim do clip

  // Moldura dourada.
  ctx.save();
  roundRect(ctx, M, M, cardW, cardH, R);
  const border = ctx.createLinearGradient(0, 0, STICKER_W, STICKER_H);
  border.addColorStop(0, C.gold);
  border.addColorStop(0.5, C.yellow);
  border.addColorStop(1, C.gold);
  ctx.strokeStyle = border;
  ctx.lineWidth = 10;
  ctx.stroke();
  // linha interna sutil
  roundRect(ctx, M + 9, M + 9, cardW - 18, cardH - 18, R - 9);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  return canvas.toDataURL('image/png');
}

// ---------- helpers de desenho ----------

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Bandeira do Brasil estilizada (design original, não é o asset oficial). */
function drawFlagBR(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = C.greenBr;
  ctx.fill();
  ctx.restore();

  const cxF = x + w / 2;
  const cyF = y + h / 2;
  // losango amarelo
  ctx.beginPath();
  ctx.moveTo(cxF, y + 12);
  ctx.lineTo(x + w - 14, cyF);
  ctx.lineTo(cxF, y + h - 12);
  ctx.lineTo(x + 14, cyF);
  ctx.closePath();
  ctx.fillStyle = C.yellow;
  ctx.fill();
  // círculo azul
  ctx.beginPath();
  ctx.arc(cxF, cyF, h * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = C.blue;
  ctx.fill();
  // faixa branca curva
  ctx.save();
  ctx.beginPath();
  ctx.arc(cxF, cyF, h * 0.24, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cxF, cyF + h * 0.22, h * 0.26, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.restore();
  // moldura da bandeira
  roundRect(ctx, x, y, w, h, 12);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/** Fila de estrelas (estilo "rating", decorativo). */
function drawStars(
  ctx: CanvasRenderingContext2D,
  rightX: number,
  cy: number,
  count: number,
  size: number,
): void {
  const gap = size * 2.1;
  for (let i = 0; i < count; i++) {
    const sx = rightX - i * gap;
    drawStar(ctx, sx, cy, size, C.yellow);
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cxS: number,
  cyS: number,
  r: number,
  color: string,
): void {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI / 2) * 3 + (i * 2 * Math.PI) / 5;
    ctx.lineTo(cxS + Math.cos(a) * r, cyS + Math.sin(a) * r);
    const a2 = a + Math.PI / 5;
    ctx.lineTo(cxS + Math.cos(a2) * (r * 0.45), cyS + Math.sin(a2) * (r * 0.45));
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.fill();
  ctx.restore();
}

// ---------- helpers utilitários ----------

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao carregar a imagem.'));
    };
    img.src = url;
  });
}

/** Desenha a imagem cobrindo o retângulo (object-fit: cover) com âncora 0..1. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  ax = 0.5,
  ay = 0.5,
): void {
  const scale = Math.max(dw / img.width, dh / img.height);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (img.width - sw) * ax;
  const sy = (img.height - sh) * ay;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

/** Define a maior fonte (≤ base, ≥ min) que faz o texto caber em `maxW`. */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  base: number,
  min: number,
  weight: string,
  family: string,
): void {
  let size = base;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxW) return;
    size -= 2;
  } while (size > min);
  ctx.font = `${weight} ${min}px ${family}`;
}
