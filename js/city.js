// City backdrop — bold sky, silhouette rooftops in parallax layers.
// Procedural now; swap in real sprite art later per the hybrid
// visual-art decision. Kept in its own file so later biomes
// (forest.js, industrial.js) can drop in beside it the same way.

const CITY = {
  skyTop: '#3fb6d3',
  skyBottom: '#8fe3d0',

  // Each layer: scroll speed relative to camera (0 = static, 1 = full
  // speed with the world), silhouette color, and a seeded building
  // generator so shapes stay consistent frame to frame without
  // storing full geometry.
  layers: [
    { parallax: 0.2, color: 'rgba(20, 60, 70, 0.35)', seed: 1, baseHeight: 140, roofY: 0.55 },
    { parallax: 0.45, color: 'rgba(20, 60, 70, 0.55)', seed: 2, baseHeight: 220, roofY: 0.65 },
    { parallax: 0.75, color: 'rgba(20, 60, 70, 0.8)', seed: 3, baseHeight: 300, roofY: 0.78 }
  ]
};

// Cheap seeded pseudo-random so the same x-range always generates
// the same building shapes, without pre-storing a building list.
function cityHash(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function drawCityBackdrop(ctx, canvasWidth, canvasHeight, cameraX) {
  // Sky gradient — bold, saturated, sets the "arcade energy" tone
  // before any silhouette detail is added on top.
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

  ctx.fillStyle = layer.color;

  const buildingWidth = 140;
  const startIndex = Math.floor((layerOffsetX - buildingWidth) / buildingWidth);
  const endIndex = Math.ceil((layerOffsetX + canvasWidth + buildingWidth) / buildingWidth);

  for (let i = startIndex; i <= endIndex; i++) {
    const worldX = i * buildingWidth;
    const screenX = worldX - layerOffsetX;

    const h = layer.baseHeight + cityHash(i * layer.seed) * layer.baseHeight * 0.6;
    const w = buildingWidth * (0.7 + cityHash(i * layer.seed + 0.5) * 0.3);

    ctx.fillRect(screenX, horizonY - h, w, h + canvasHeight);

    // A crane or water tower silhouette on roughly every third
    // building, for city-specific character beyond plain blocks.
    if (i % 3 === 0) {
      const craneX = screenX + w * 0.5;
      const craneTopY = horizonY - h - 60;
      ctx.fillRect(craneX - 3, craneTopY, 6, 60);
      ctx.fillRect(craneX - 40, craneTopY, 80, 5);
    }
  }
}
