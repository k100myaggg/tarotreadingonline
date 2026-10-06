import * as THREE from "three";

// Cache created textures to prevent re-generation and memory leaks
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates a high-fidelity procedural sacred geometry gold card back
 */
export function getCardBackTexture(): THREE.CanvasTexture {
  const cacheKey = "card_back_sacred_gold";
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  if (typeof document === "undefined") {
    return new THREE.CanvasTexture(new OffscreenCanvas(2, 2) as any);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 870;
  const ctx = canvas.getContext("2d")!;

  // Deep obsidian velvet base
  ctx.fillStyle = "#0c0a17";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Intricate Gold Border
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 10;
  ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

  ctx.strokeStyle = "rgba(243, 226, 149, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

  // Inner corner flourishes
  const cornerSize = 40;
  const corners = [
    [32, 32],
    [canvas.width - 32, 32],
    [32, canvas.height - 32],
    [canvas.width - 32, canvas.height - 32],
  ];
  ctx.fillStyle = "#d4af37";
  for (const [x, y] of corners) {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central Sacred Geometry: Flower of Life & Sunburst
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Concentric mystical circles
  ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
  ctx.lineWidth = 2;
  for (let r = 40; r <= 180; r += 28) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Radiating 24 celestial sun rays
  ctx.strokeStyle = "rgba(243, 226, 149, 0.5)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI) / 12;
    ctx.beginPath();
    ctx.moveTo(centerX + Math.cos(angle) * 50, centerY + Math.sin(angle) * 50);
    ctx.lineTo(centerX + Math.cos(angle) * 190, centerY + Math.sin(angle) * 190);
    ctx.stroke();
  }

  // Central Octagram (8-pointed star)
  ctx.strokeStyle = "#f3e5ab";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const rOuter = 75;
    const rInner = 35;
    const x1 = centerX + Math.cos(angle) * rOuter;
    const y1 = centerY + Math.sin(angle) * rOuter;
    const x2 = centerX + Math.cos(angle + Math.PI / 8) * rInner;
    const y2 = centerY + Math.sin(angle + Math.PI / 8) * rInner;
    if (i === 0) ctx.moveTo(x1, y1);
    else ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.closePath();
  ctx.stroke();

  // Subtle center jewel
  ctx.fillStyle = "#d4af37";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates an authentic tarot card face texture with title, arcana styling, and iconography
 */
export function getCardFrontTexture(
  cardName: string,
  arcana: string,
  suit: string | null,
  keywords: string[]
): THREE.CanvasTexture {
  const cacheKey = `card_front_${cardName}_${keywords.join("_")}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  if (typeof document === "undefined") {
    return new THREE.CanvasTexture(new OffscreenCanvas(2, 2) as any);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 870;
  const ctx = canvas.getContext("2d")!;

  // Parchment / Dark Mystic Ivory gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, "#1a162b");
  bgGrad.addColorStop(0.5, "#120e22");
  bgGrad.addColorStop(1, "#0a0714");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Antique gold border
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);

  // Top Arcana Banner
  ctx.fillStyle = "#d4af37";
  ctx.font = "bold 18px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.letterSpacing = "3px";
  ctx.fillText(
    arcana === "major" ? "MAJOR ARCANA" : `${suit?.toUpperCase() || "SUIT"}`,
    canvas.width / 2,
    60
  );

  // Central Card Art Frame
  const frameX = 46;
  const frameY = 85;
  const frameW = canvas.width - 92;
  const frameH = 540;

  ctx.fillStyle = "#090712";
  ctx.fillRect(frameX, frameY, frameW, frameH);
  ctx.strokeStyle = "rgba(212, 175, 55, 0.5)";
  ctx.lineWidth = 3;
  ctx.strokeRect(frameX, frameY, frameW, frameH);

  // Artwork Iconography Archetype
  const centerX = canvas.width / 2;
  const centerY = frameY + frameH / 2;

  // Symbolic glyph
  ctx.font = "80px serif";
  let symbol = "✨";
  if (arcana === "major") symbol = "🔮";
  else if (suit === "wands") symbol = "🔥";
  else if (suit === "cups") symbol = "🌊";
  else if (suit === "swords") symbol = "🗡️";
  else if (suit === "pentacles") symbol = "⭐";

  ctx.fillText(symbol, centerX, centerY - 20);

  // Radiating rays behind symbol
  ctx.strokeStyle = "rgba(243, 226, 149, 0.25)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8;
    ctx.beginPath();
    ctx.moveTo(centerX + Math.cos(angle) * 70, centerY - 20 + Math.sin(angle) * 70);
    ctx.lineTo(centerX + Math.cos(angle) * 160, centerY - 20 + Math.sin(angle) * 160);
    ctx.stroke();
  }

  // Card Name in Serif Calligraphy
  ctx.fillStyle = "#f3e5ab";
  ctx.font = "bold 30px 'Cinzel', 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.fillText(cardName, centerX, 680);

  // Core Keywords below name
  ctx.fillStyle = "#a78bfa";
  ctx.font = "16px 'Courier New', monospace";
  ctx.letterSpacing = "1px";
  const kwText = keywords.slice(0, 3).join(" • ");
  ctx.fillText(kwText.toUpperCase(), centerX, 725);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  textureCache.set(cacheKey, texture);
  return texture;
}
