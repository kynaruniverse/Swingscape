// City backdrop — bold sky, layered rooftop silhouettes with simple
// faux-3D shading and window detail. Procedural now; swap in real
// sprite art later per the hybrid visual-art decision.
//
// Depth is communicated through solid color/brightness differences
// and atmospheric fade — NOT transparency stacking, which washes
// layers out where they overlap.

const CITY = {
  skyTop: '#2fb8d6',
  skyBottom: '#8fe3d0',

  // Light direction for the faux-3D shading pass — buildings get a
  // brighter face on this side and a darker face on the other,
  // which is what actually sells "3D" on a flat silhouette.
  lightFromRight: true,

  layers: [
    // Far layer: cooler, desaturated, blends toward the sky color at
    // the top edge — classic aerial-perspective distance cue.
    { parallax: 0.2, base: '#1f5a68', lit: '#2c7385', shadow: '#173f49', seed: 1, baseHeight: 130, roofY: 0.5, fade: 0.35, windows: false },
    // Mid layer: fuller color, still clearly behind the front row.
    { parallax: 0.45, base: '#134650', lit: '#1c5c69', shadow: '#0d333b', seed: 2, baseHeight: 210, roofY: 0.6, fade: 0.12, windows: true },
    // Near layer: darkest/boldest, full detail, closest to camera.
    { parallax: 0.75, base: '#0b2e36', lit: '#134450', shadow: '#071c21', seed: 3, baseHeight: 300, roofY: 0.74, fade: 0, windows: true }
  ]
};

function cityHash(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function drawCityBackdrop(ctx, canvasWidth, canvasHeight, cameraX) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  skyGrad.addColorStop(0, CITY.skyTop);
  skyGrad.addColorStop(1, CITY.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  for (const layer of CITY.layers) {
    drawBuildingLayer(ctx, canvasWidth, canvasHeight, cameraX, layer);
  }
}

function drawBuildingLayer(ctx, canvasWidth, canvasHeight, cameraX, layer) {
  const layerOffsetX = cameraX * layer.parallax;
  const horizonY = canvasHeight * layer.roofY;

  const buildingWidth = 150;
  const startIndex = Math.floor((layerOffsetX - buildingWidth) / buildingWidth);
  const endIndex = Math.ceil((layerOffsetX + canvasWidth + buildingWidth) / buildingWidth);

  for (let i = startIndex; i <= endIndex; i++) {
    const worldX = i * buildingWidth;
    const screenX = worldX - layerOffsetX;

    const h = layer.baseHeight + cityHash(i * layer.seed) * layer.baseHeight * 0.7;
    const w = buildingWidth * (0.72 + cityHash(i * layer.seed + 0.5) * 0.26);
    const roofTopY = horizonY - h;

    drawBuilding(ctx, screenX, roofTopY, w, h + canvasHeight, layer, i);
  }
}

function drawBuilding(ctx, x, roofY, w, h, layer, seedIndex) {
  // Faux-3D: split the building into a lit face and a shadow face.
  // lightFromRight = true means the right-hand portion is brighter.
  const splitRatio = 0.62;
  const litWidth = w * splitRatio;
  const shadowWidth = w - litWidth;

  if (CITY.lightFromRight) {
    ctx.fillStyle = layer.shadow;
    ctx.fillRect(x, roofY, shadowWidth, h);
    ctx.fillStyle = layer.lit;
    ctx.fillRect(x + shadowWidth, roofY, litWidth, h);
  } else {
    ctx.fillStyle = layer.lit;
    ctx.fillRect(x, roofY, litWidth, h);
    ctx.fillStyle = layer.shadow;
    ctx.fillRect(x + litWidth, roofY, shadowWidth, h);
  }

  // Rooftop parapet line — a thin darker strip reads as a rooftop
  // edge and stops the silhouette looking like a flat cut-out block.
  ctx.fillStyle = layer.shadow;
  ctx.fillRect(x, roofY, w, 6);

  // Simple window grid on nearer layers only — cheap texture that
  // adds a lot of perceived detail for very little drawing cost.
  if (layer.windows) {
    drawWindows(ctx, x, roofY + 16, w, Math.min(h, 480), layer, seedIndex);
  }

  // Occasional rooftop antenna/water-tower silhouette for city
  // character beyond plain blocks.
  if (seedIndex % 3 === 0) {
    const craneX = x + w * 0.5;
    ctx.fillStyle = layer.shadow;
    ctx.fillRect(craneX - 3, roofY - 55, 6, 55);
    ctx.fillRect(craneX - 34, roofY - 55, 68, 5);
  } else if (seedIndex % 5 === 0) {
    const towerX = x + w * 0.5;
    ctx.fillStyle = layer.shadow;
    ctx.beginPath();
    ctx.moveTo(towerX - 16, roofY);
    ctx.lineTo(towerX + 16, roofY);
    ctx.lineTo(towerX + 10, roofY - 34);
    ctx.lineTo(towerX - 10, roofY - 34);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(towerX - 4, roofY - 34, 8, 8);
  }

  // Atmospheric fade for distant layers: a translucent sky-tint wash
  // OVER the finished building, not blended between buildings — this
  // is what avoids the murky double-transparency look from before.
  if (layer.fade > 0) {
    ctx.fillStyle = `rgba(143, 227, 208, ${layer.fade})`;
    ctx.fillRect(x, roofY, w, h);
  }
}

function drawWindows(ctx, x, y, w, h, layer, seedIndex) {
  const winW = 10;
  const winH = 14;
  const gapX = 8;
  const gapY = 16;

  const cols = Math.floor(w / (winW + gapX));
  const rows = Math.floor(h / (winH + gapY));

  const marginX = (w - cols * (winW + gapX)) / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const hash = cityHash(seedIndex * 97 + row * 13 + col * 7);
      // Most windows dark/unlit against the building face; a
      // scattering are "lit" for warmth and life without needing
      // real animation.
      if (hash > 0.82) {
        ctx.fillStyle = 'rgba(255, 214, 120, 0.85)';
      } else if (hash > 0.7) {
        ctx.fillStyle = 'rgba(200, 235, 240, 0.25)';
      } else {
        continue; // leave most windows as bare wall for a cleaner look
      }

      ctx.fillRect(
        x + marginX + col * (winW + gapX),
        y + row * (winH + gapY),
        winW,
        winH
      );
    }
  }
}
