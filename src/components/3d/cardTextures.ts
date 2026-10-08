import * as THREE from "three";
import { CARD_IMAGE_MAP, getCardImagePath, CARD_BACK_IMAGE_PATH } from "@/lib/tarot/cardImages";

// ─── Texture cache to prevent memory leaks and re-generation ───
const textureCache = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();

/**
 * Returns the authentic card back texture loaded from the card_back.jpg artwork image.
 * Retains procedural canvas as fallback if offline or image loading fails.
 */
export function getCardBackTexture(): THREE.Texture {
  const cacheKey = "card_back_real_artwork";
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  if (typeof document === "undefined") {
    return createProceduralCardBack();
  }

  const texture = loader.load(
    CARD_BACK_IMAGE_PATH,
    (tex) => {
      tex.anisotropy = 8;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
    },
    undefined,
    () => {
      // Fallback if image fails to load
      const fallback = createProceduralCardBack();
      textureCache.set(cacheKey, fallback);
    }
  );
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Returns a card front texture for a given card. Uses real generated image if available,
 * otherwise falls back to a premium procedural texture.
 */
export function getCardFrontTexture(
  cardId: string,
  cardName: string,
  arcana: string,
  suit: string | null,
  keywords: string[],
  numeral?: string
): THREE.Texture {
  const cacheKey = `card_front_${cardId}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  // Check if we have a real generated image
  const imagePath = CARD_IMAGE_MAP[cardId];
  if (imagePath) {
    const texture = loader.load(
      imagePath,
      (tex) => {
        tex.anisotropy = 8;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
      },
      undefined,
      () => {
        // On error, replace with procedural
        const fallback = createProceduralCardFront(cardName, arcana, suit, keywords, numeral);
        textureCache.set(cacheKey, fallback);
      }
    );
    texture.anisotropy = 8;
    texture.colorSpace = THREE.SRGBColorSpace;
    textureCache.set(cacheKey, texture);
    return texture;
  }

  // No real image — create premium procedural texture
  const tex = createProceduralCardFront(cardName, arcana, suit, keywords, numeral);
  textureCache.set(cacheKey, tex);
  return tex;
}

// ─── Procedural Luxury Sacred Gold-Foil Card Back ───
function createProceduralCardBack(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture(new OffscreenCanvas(2, 2) as unknown as HTMLCanvasElement);
  }

  const W = 768;
  const H = 1300;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 1. Rich Royal Velvet Background (Luminous Amethyst & Deep Indigo, NOT black!)
  const bg = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 650);
  bg.addColorStop(0, "#431e78");    // Vibrant royal purple center
  bg.addColorStop(0.4, "#2d1257");  // Rich imperial violet
  bg.addColorStop(0.8, "#1e0b3c");  // Deep mystic indigo
  bg.addColorStop(1, "#15062c");    // Twilight amethyst perimeter
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 2. Subtle sacred geometric star grid pattern in background
  ctx.strokeStyle = "rgba(255, 215, 0, 0.08)";
  ctx.lineWidth = 1;
  const step = 48;
  for (let x = 0; x <= W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // 3. Cosmic stardust golden particles
  ctx.fillStyle = "rgba(255, 235, 150, 0.6)";
  for (let i = 0; i < 220; i++) {
    const sx = Math.random() * W;
    const sy = Math.random() * H;
    const sr = Math.random() < 0.25 ? 2.2 : 1.2;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. HEAVY RADIANT SOLID GOLD FOIL OUTER BORDER (Makes cards instantly pop out!)
  // Outermost solid gold bevel band
  const goldGrad = ctx.createLinearGradient(0, 0, W, H);
  goldGrad.addColorStop(0, "#ffeaa7");
  goldGrad.addColorStop(0.25, "#ffd700");
  goldGrad.addColorStop(0.5, "#fff3b0");
  goldGrad.addColorStop(0.75, "#d4af37");
  goldGrad.addColorStop(1, "#ffeaa7");

  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 22;
  ctx.strokeRect(11, 11, W - 22, H - 22);

  // High-contrast bright pinstripes
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 5;
  ctx.strokeRect(32, 32, W - 64, H - 64);

  ctx.strokeStyle = "rgba(255, 235, 170, 0.9)";
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, W - 88, H - 88);

  const cx = W / 2;
  const cy = H / 2;

  // 5. Ornate Golden Corner Cartouches & Stars
  const drawCornerFlourish = (x: number, y: number, flipX: number, flipY: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flipX, flipY);

    // Corner diamond crest
    ctx.fillStyle = "#ffeaa7";
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(16, 0);
    ctx.lineTo(0, -16);
    ctx.lineTo(-16, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();

    // Corner scroll brackets
    ctx.beginPath();
    ctx.moveTo(0, 36);
    ctx.quadraticCurveTo(24, 24, 36, 0);
    ctx.stroke();

    ctx.restore();
  };

  drawCornerFlourish(64, 64, 1, 1);
  drawCornerFlourish(W - 64, 64, -1, 1);
  drawCornerFlourish(64, H - 64, 1, -1);
  drawCornerFlourish(W - 64, H - 64, -1, -1);

  // 6. Central Luminous Solar & Lunar Mandala
  // Bright outer golden halo glow
  const halo = ctx.createRadialGradient(cx, cy, 60, cx, cy, 320);
  halo.addColorStop(0, "rgba(255, 220, 100, 0.45)");
  halo.addColorStop(0.6, "rgba(255, 215, 0, 0.2)");
  halo.addColorStop(1, "rgba(255, 215, 0, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, 320, 0, Math.PI * 2);
  ctx.fill();

  // Multi-layered concentric sacred golden rings
  const rings = [70, 120, 170, 220, 270, 290];
  rings.forEach((r, idx) => {
    ctx.strokeStyle = idx % 2 === 0 ? "#ffd700" : "#fff2a8";
    ctx.lineWidth = idx === rings.length - 2 ? 5 : 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // 24 Radiant Golden Sun Rays
  ctx.strokeStyle = "#ffe57f";
  ctx.lineWidth = 3;
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12;
    const rStart = i % 2 === 0 ? 80 : 130;
    const rEnd = i % 2 === 0 ? 268 : 235;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * rStart, cy + Math.sin(a) * rStart);
    ctx.lineTo(cx + Math.cos(a) * rEnd, cy + Math.sin(a) * rEnd);
    ctx.stroke();
  }

  // 12 Outer Zodiac / Star Orbs with bright white centers
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    const ox = cx + Math.cos(a) * 220;
    const oy = cy + Math.sin(a) * 220;
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(ox, oy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 16-Point Double Octagram Star
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    const r = i % 2 === 0 ? 120 : 55;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // Central Sun / Eye Jewel (Brilliant White-Gold)
  const jewel = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
  jewel.addColorStop(0, "#ffffff");
  jewel.addColorStop(0.3, "#fff8b0");
  jewel.addColorStop(0.7, "#ffd700");
  jewel.addColorStop(1, "#c68e17");
  ctx.fillStyle = jewel;
  ctx.beginPath();
  ctx.arc(cx, cy, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// ─── Procedural Fallback: Premium Card Front ───
function createProceduralCardFront(
  cardName: string,
  arcana: string,
  suit: string | null,
  keywords: string[],
  numeral?: string
): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture(new OffscreenCanvas(2, 2) as unknown as HTMLCanvasElement);
  }

  const W = 512;
  const H = 870;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ─── Suit-themed color palette ───
  const palettes: Record<string, { bg1: string; bg2: string; accent: string; glow: string }> = {
    wands: { bg1: "#2a1508", bg2: "#1a0c04", accent: "#e8852e", glow: "rgba(232,133,46,0.15)" },
    cups: { bg1: "#0a1628", bg2: "#060e1a", accent: "#4a9eff", glow: "rgba(74,158,255,0.15)" },
    swords: { bg1: "#1a1a24", bg2: "#0e0e16", accent: "#a8b4c8", glow: "rgba(168,180,200,0.15)" },
    pentacles: { bg1: "#1a1f0a", bg2: "#0e1406", accent: "#8bc34a", glow: "rgba(139,195,74,0.15)" },
    major: { bg1: "#1c1230", bg2: "#0c0820", accent: "#c9a0dc", glow: "rgba(201,160,220,0.15)" },
  };
  const palette = palettes[suit || "major"] || palettes.major;

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, palette.bg1);
  bgGrad.addColorStop(0.5, palette.bg2);
  bgGrad.addColorStop(1, "#050308");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Atmospheric radial glow
  const radGlow = ctx.createRadialGradient(W / 2, H * 0.4, 20, W / 2, H * 0.4, 250);
  radGlow.addColorStop(0, palette.glow);
  radGlow.addColorStop(1, "transparent");
  ctx.fillStyle = radGlow;
  ctx.fillRect(0, 0, W, H);

  // Gold border frame
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 8;
  roundRect(ctx, 14, 14, W - 28, H - 28, 12);
  ctx.stroke();
  ctx.strokeStyle = "rgba(212,175,55,0.35)";
  ctx.lineWidth = 2;
  roundRect(ctx, 24, 24, W - 48, H - 48, 8);
  ctx.stroke();

  // Corner ornaments
  const corners: [number, number, number, number][] = [
    [38, 38, 1, 1], [W - 38, 38, -1, 1],
    [38, H - 38, 1, -1], [W - 38, H - 38, -1, -1],
  ];
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 2;
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * 30);
    ctx.quadraticCurveTo(x, y, x + dx * 30, y);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(x + dx * 5, y + dy * 5, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#d4af37"; ctx.fill();
  }

  // ─── Top numeral banner ───
  if (numeral) {
    ctx.fillStyle = "rgba(212,175,55,0.15)";
    roundRect(ctx, W / 2 - 40, 38, 80, 36, 8);
    ctx.fill();
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 1.5;
    roundRect(ctx, W / 2 - 40, 38, 80, 36, 8);
    ctx.stroke();
    ctx.fillStyle = "#f3e5ab";
    ctx.font = "bold 20px 'Cinzel', 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(numeral, W / 2, 56);
  }

  // ─── Arcana tag ───
  ctx.fillStyle = "#d4af37";
  ctx.font = "bold 14px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const tagText = arcana === "major" ? "MAJOR ARCANA" : (suit || "").toUpperCase();
  ctx.fillText(tagText, W / 2, 85);

  // ─── Central art frame ───
  const frameX = 44, frameY = 110, frameW = W - 88, frameH = 480;
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  roundRect(ctx, frameX, frameY, frameW, frameH, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(212,175,55,0.4)";
  ctx.lineWidth = 2;
  roundRect(ctx, frameX, frameY, frameW, frameH, 6);
  ctx.stroke();

  // ─── Central Illustrated Element ───
  const artCx = W / 2;
  const artCy = frameY + frameH / 2;

  // Radiating celestial rays behind symbol
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1;
  for (let i = 0; i < 32; i++) {
    const angle = (i * Math.PI * 2) / 32;
    ctx.beginPath();
    ctx.moveTo(artCx + Math.cos(angle) * 40, artCy + Math.sin(angle) * 40);
    ctx.lineTo(artCx + Math.cos(angle) * 180, artCy + Math.sin(angle) * 180);
    ctx.stroke();
  }
  ctx.restore();

  // Concentric ritual circles
  ctx.strokeStyle = palette.accent;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1;
  for (let r = 50; r <= 140; r += 30) {
    ctx.beginPath(); ctx.arc(artCx, artCy, r, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  // ─── Draw rich suit-specific central glyph ───
  drawSuitGlyph(ctx, artCx, artCy, suit, arcana, palette.accent);

  // ─── Card Name ───
  ctx.fillStyle = "#f3e5ab";
  ctx.font = "bold 28px 'Cinzel', 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Word-wrap long names
  const maxWidth = W - 100;
  const words = cardName.split(" ");
  let line = "";
  let lineY = frameY + frameH + 20;
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, W / 2, lineY);
      line = word;
      lineY += 36;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, W / 2, lineY);

  // ─── Keywords ───
  const kwY = lineY + 44;
  ctx.fillStyle = palette.accent;
  ctx.font = "14px 'Courier New', monospace";
  const kwText = keywords.slice(0, 3).join("  ·  ").toUpperCase();
  ctx.fillText(kwText, W / 2, kwY);

  // ─── Bottom ornamental divider ───
  ctx.strokeStyle = "rgba(212,175,55,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, kwY + 30);
  ctx.lineTo(W - 80, kwY + 30);
  ctx.stroke();

  // Tiny diamond at center of divider
  ctx.fillStyle = "#d4af37";
  ctx.beginPath();
  ctx.moveTo(W / 2, kwY + 25);
  ctx.lineTo(W / 2 + 6, kwY + 30);
  ctx.lineTo(W / 2, kwY + 35);
  ctx.lineTo(W / 2 - 6, kwY + 30);
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

// ─── Draw suit-specific central glyph ───
function drawSuitGlyph(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  suit: string | null,
  arcana: string,
  accent: string
) {
  ctx.save();

  if (arcana === "major") {
    // Eye of Providence / All-seeing eye
    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;
    ctx.lineWidth = 2.5;

    // Triangle
    ctx.beginPath();
    ctx.moveTo(cx, cy - 70);
    ctx.lineTo(cx + 65, cy + 40);
    ctx.lineTo(cx - 65, cy + 40);
    ctx.closePath();
    ctx.stroke();

    // Eye
    ctx.beginPath();
    ctx.ellipse(cx, cy - 5, 35, 20, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Iris
    const irisGrad = ctx.createRadialGradient(cx, cy - 5, 0, cx, cy - 5, 14);
    irisGrad.addColorStop(0, "#f9e295");
    irisGrad.addColorStop(1, accent);
    ctx.fillStyle = irisGrad;
    ctx.beginPath(); ctx.arc(cx, cy - 5, 14, 0, Math.PI * 2); ctx.fill();

    // Pupil
    ctx.fillStyle = "#0a0714";
    ctx.beginPath(); ctx.arc(cx, cy - 5, 6, 0, Math.PI * 2); ctx.fill();

    // Light dot
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(cx + 3, cy - 8, 2, 0, Math.PI * 2); ctx.fill();

  } else if (suit === "wands") {
    // Flowering wand with flame
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 80);
    ctx.lineTo(cx, cy - 60);
    ctx.stroke();

    // Bark texture knots
    ctx.fillStyle = "rgba(139,90,43,0.6)";
    for (const dy of [-30, 0, 30]) {
      ctx.beginPath(); ctx.ellipse(cx, cy + dy, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
    }

    // Flame at top
    const flameGrad = ctx.createRadialGradient(cx, cy - 80, 0, cx, cy - 70, 40);
    flameGrad.addColorStop(0, "#ffe066");
    flameGrad.addColorStop(0.5, accent);
    flameGrad.addColorStop(1, "rgba(232,133,46,0)");
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 55);
    ctx.quadraticCurveTo(cx - 10, cy - 95, cx, cy - 110);
    ctx.quadraticCurveTo(cx + 10, cy - 95, cx + 20, cy - 55);
    ctx.closePath();
    ctx.fill();

    // Leaves
    ctx.fillStyle = "rgba(120,200,80,0.6)";
    for (const [sx, sy, flip] of [[-1, -20, 1], [1, 10, -1]] as [number, number, number][]) {
      ctx.beginPath();
      ctx.ellipse(cx + sx * 25, cy + sy, 20, 8, (flip * Math.PI) / 6, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (suit === "cups") {
    // Ornate chalice with water
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;

    // Cup bowl
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy - 30);
    ctx.quadraticCurveTo(cx - 45, cy + 20, cx - 20, cy + 30);
    ctx.lineTo(cx + 20, cy + 30);
    ctx.quadraticCurveTo(cx + 45, cy + 20, cx + 40, cy - 30);
    ctx.closePath();
    ctx.stroke();

    // Water inside
    const waterGrad = ctx.createLinearGradient(0, cy - 10, 0, cy + 28);
    waterGrad.addColorStop(0, "rgba(74,158,255,0.4)");
    waterGrad.addColorStop(1, "rgba(74,158,255,0.15)");
    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 35, cy);
    ctx.quadraticCurveTo(cx, cy + 8, cx + 35, cy);
    ctx.quadraticCurveTo(cx + 42, cy + 20, cx + 20, cy + 28);
    ctx.lineTo(cx - 20, cy + 28);
    ctx.quadraticCurveTo(cx - 42, cy + 20, cx - 35, cy);
    ctx.fill();

    // Stem
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy + 30); ctx.lineTo(cx - 5, cy + 65);
    ctx.lineTo(cx + 5, cy + 65); ctx.lineTo(cx + 5, cy + 30);
    ctx.stroke();

    // Base
    ctx.beginPath();
    ctx.ellipse(cx, cy + 68, 30, 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Drops rising
    ctx.fillStyle = accent;
    for (const [dx, dy] of [[-8, -50], [8, -60], [0, -75]]) {
      ctx.beginPath();
      ctx.moveTo(cx + dx, cy + dy);
      ctx.quadraticCurveTo(cx + dx - 4, cy + dy - 8, cx + dx, cy + dy - 14);
      ctx.quadraticCurveTo(cx + dx + 4, cy + dy - 8, cx + dx, cy + dy);
      ctx.fill();
    }

  } else if (suit === "swords") {
    // Elegant sword
    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;
    ctx.lineWidth = 2;

    // Blade
    ctx.beginPath();
    ctx.moveTo(cx, cy - 100);
    ctx.lineTo(cx + 8, cy + 10);
    ctx.lineTo(cx - 8, cy + 10);
    ctx.closePath();
    ctx.stroke();

    // Blade shine
    ctx.fillStyle = "rgba(168,180,200,0.2)";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 100);
    ctx.lineTo(cx + 3, cy + 10);
    ctx.lineTo(cx - 3, cy + 10);
    ctx.closePath();
    ctx.fill();

    // Cross-guard
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 35, cy + 12);
    ctx.quadraticCurveTo(cx, cy + 18, cx + 35, cy + 12);
    ctx.stroke();

    // Grip
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 14); ctx.lineTo(cx, cy + 55);
    ctx.stroke();

    // Grip wrapping
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 1;
    for (let y = cy + 18; y < cy + 52; y += 6) {
      ctx.beginPath();
      ctx.moveTo(cx - 4, y); ctx.lineTo(cx + 4, y + 3);
      ctx.stroke();
    }

    // Pommel
    ctx.fillStyle = "#d4af37";
    ctx.beginPath(); ctx.arc(cx, cy + 60, 6, 0, Math.PI * 2); ctx.fill();

    // Crown at tip
    ctx.strokeStyle = "rgba(212,175,55,0.5)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const a = Math.PI + (i * Math.PI) / 4 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 100);
      ctx.lineTo(cx + Math.cos(a) * 20, cy - 100 + Math.sin(a) * 20);
      ctx.stroke();
    }

  } else if (suit === "pentacles") {
    // Pentacle coin with star
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;

    // Outer circle
    ctx.beginPath(); ctx.arc(cx, cy, 65, 0, Math.PI * 2); ctx.stroke();

    // Inner circle
    ctx.strokeStyle = "rgba(139,195,74,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI * 2); ctx.stroke();

    // Pentagram
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI * 2) / 5;
      const x = cx + Math.cos(a) * 48;
      const y = cy + Math.sin(a) * 48;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Center jewel
    const pGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
    pGrad.addColorStop(0, "#c8e6c9");
    pGrad.addColorStop(1, accent);
    ctx.fillStyle = pGrad;
    ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();

    // Vine decorations
    ctx.strokeStyle = "rgba(139,195,74,0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 68, cy + Math.sin(a) * 68);
      ctx.quadraticCurveTo(
        cx + Math.cos(a + 0.3) * 90,
        cy + Math.sin(a + 0.3) * 90,
        cx + Math.cos(a) * 100,
        cy + Math.sin(a) * 100
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ─── Utility: Rounded rectangle path ───
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
