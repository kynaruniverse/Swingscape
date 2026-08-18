// Foreground gameplay art: anchors, hazard strips, moving obstacles,
// goal marker. Matches the bold/high-contrast palette and chalky
// double-stroke line technique established in city.js and player.js
// (reuses sketchLine from player.js — same global scope).
//
// All functions are pure draw calls: given state + a canvas context,
// they render. No physics/logic lives here.

const ART = {
  anchorColor: '#ffd23f',
  anchorGlow: '#fff2b8',
  anchorActive: '#ff4d3d',
  hazardColor: '#ff2e63',
  hazardDark: '#7a0f2b',
  stripeLight: '#ffd23f',
  obstacleBase: '#4a4e69',
  obstacleLit: '#6b7099',
  obstacleShadow: '#2e3050',
  goalFlagA: '#ff4d3d',
  goalFlagB: '#f5f0e6',
  goalPole: '#2b2b2b'
};

// ---------- Anchors ----------

function drawAnchor(ctx, anchor, isCurrent) {
  const t = performance.now() / 500;
  const pulse = isCurrent ? 0 : (Math.sin(t + anchor.x * 0.01) + 1) * 0.5;

  // Soft glow halo — stronger pulse when NOT attached (inviting a
  // grab), settles down once it's your current anchor.
  const glowRadius = 16 + pulse * 6;
  const grad = ctx.createRadialGradient(
    anchor.x, anchor.y, 2,
    anchor.x, anchor.y, glowRadius
  );
  grad.addColorStop(0, isCurrent ? 'rgba(255,77,61,0.55)' : 'rgba(255,210,63,0.45)');
  grad.addColorStop(1, 'rgba(255,210,63,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(anchor.x, anchor.y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Outer chalky outline ring
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(anchor.x, anchor.y, 10, 0, Math.PI * 2);
  ctx.stroke();

  // Bold fill
  ctx.fillStyle = isCurrent ? ART.anchorActive : ART.anchorColor;
  ctx.beginPath();
  ctx.arc(anchor.x, anchor.y, 8, 0, Math.PI * 2);
  ctx.fill();

  // Center rivet + small bracket marks — reads as a fixed grab-point
  // rather than a floating dot.
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(anchor.x, anchor.y, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(anchor.x - 14, anchor.y);
  ctx.lineTo(anchor.x - 10, anchor.y);
  ctx.moveTo(anchor.x + 10, anchor.y);
  ctx.lineTo(anchor.x + 14, anchor.y);
  ctx.stroke();
}

// ---------- Hazard strips ----------

function drawHazardStrip(ctx, strip, floorY) {
  if (strip.type === 'ground') {
    drawGroundHazard(ctx, strip.startX, strip.endX, floorY);
  } else {
    drawFloatingHazard(ctx, strip.startX, strip.endX, strip.y, strip.height);
  }
}

function drawGroundHazard(ctx, startX, endX, floorY) {
  const width = endX - startX;
  const bandH = 14;

  // Warning stripe base band
  const stripeW = 18;
  ctx.save();
  ctx.beginPath();
  ctx.rect(startX, floorY - bandH, width, bandH);
  ctx.clip();
  for (let x = startX - bandH; x < endX + bandH; x += stripeW) {
    ctx.fillStyle = (Math.floor((x - startX) / stripeW) % 2 === 0) ? ART.hazardColor : '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo(x + bandH, floorY - bandH);
    ctx.lineTo(x + bandH + stripeW, floorY - bandH);
    ctx.lineTo(x + stripeW, floorY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Spikes jutting up from the band
  const spikeW = 20;
  const spikeH = 30;
  ctx.fillStyle = ART.hazardColor;
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  for (let x = startX; x < endX; x += spikeW) {
    ctx.beginPath();
    ctx.moveTo(x, floorY - bandH);
    ctx.lineTo(x + spikeW / 2, floorY - bandH - spikeH);
    ctx.lineTo(x + spikeW, floorY - bandH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawFloatingHazard(ctx, startX, endX, y, height) {
  const width = endX - startX;
  const t = performance.now() / 150;

  // Jagged energy band — a zigzag strip that reads as electrified /
  // dangerous rather than solid, per its "arc around it" role.
  ctx.strokeStyle = ART.hazardDark;
  ctx.lineWidth = height;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const segments = Math.max(4, Math.floor(width / 24));
  for (let i = 0; i <= segments; i++) {
    const x = startX + (width * i) / segments;
    const wobble = Math.sin(t + i * 1.3) * (height * 0.3);
    const py = y + height / 2 + wobble;
    if (i === 0) ctx.moveTo(x, py);
    else ctx.lineTo(x, py);
  }
  ctx.stroke();

  ctx.strokeStyle = ART.hazardColor;
  ctx.lineWidth = height * 0.4;
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const x = startX + (width * i) / segments;
    const wobble = Math.sin(t + i * 1.3) * (height * 0.3);
    const py = y + height / 2 + wobble;
    if (i === 0) ctx.moveTo(x, py);
    else ctx.lineTo(x, py);
  }
  ctx.stroke();

  // Spark accents
  ctx.fillStyle = ART.stripeLight;
  for (let i = 0; i < segments; i += 2) {
    const x = startX + (width * i) / segments + 6;
    const wobble = Math.sin(t + i * 1.3) * (height * 0.3);
    const py = y + height / 2 + wobble;
    ctx.beginPath();
    ctx.arc(x, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------- Moving obstacles ----------

function drawMovingObstacle(ctx, obs) {
  const x = obs.x;
  const y = obs.y;
  const w = obs.width;
  const h = obs.height;

  // Two-tone beam, same lit/shadow language as the city buildings —
  // keeps foreground and background feeling like one consistent style.
  ctx.fillStyle = ART.obstacleShadow;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = ART.obstacleLit;
  ctx.fillRect(x, y, w, h * 0.55);

  // Diagonal warning stripes on the leading/trailing edges
  const stripeW = 8;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = ART.stripeLight;
  for (let sx = x - h; sx < x + w + h; sx += stripeW * 2) {
    ctx.beginPath();
    ctx.moveTo(sx, y + h);
    ctx.lineTo(sx + h, y);
    ctx.lineTo(sx + h + stripeW, y);
    ctx.lineTo(sx + stripeW, y + h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Outline + rivets
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#1a1a1a';
  for (const rx of [x + 6, x + w - 6]) {
    ctx.beginPath();
    ctx.arc(rx, y + h / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------- Goal ----------

function drawGoal(ctx, goalX, floorY) {
  const poleTopY = floorY - 220;
  const t = performance.now() / 400;

  // Glow halo behind the goal so it reads from a distance, per the
  // Design Bible's "always something to swing toward" principle.
  const grad = ctx.createRadialGradient(
    goalX, poleTopY + 40, 10,
    goalX, poleTopY + 40, 120
  );
  grad.addColorStop(0, 'rgba(255,210,63,0.35)');
  grad.addColorStop(1, 'rgba(255,210,63,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(goalX, poleTopY + 40, 120, 0, Math.PI * 2);
  ctx.fill();

  // Pole
  ctx.strokeStyle = ART.goalPole;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(goalX, floorY);
  ctx.lineTo(goalX, poleTopY);
  ctx.stroke();

  // Waving checkered flag — a few trapezoid segments with a sine
  // offset per segment to fake cloth movement cheaply.
  const flagW = 70;
  const flagH = 44;
  const segments = 6;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(goalX, poleTopY);
  for (let i = 0; i <= segments; i++) {
    const fx = goalX + (flagW * i) / segments;
    const wave = Math.sin(t + i * 0.8) * 6;
    const fy = poleTopY - flagH / 2 + wave;
    ctx.lineTo(fx, i === 0 ? poleTopY : fy);
  }
  for (let i = segments; i >= 0; i--) {
    const fx = goalX + (flagW * i) / segments;
    const wave = Math.sin(t + i * 0.8) * 6;
    const fy = poleTopY + flagH / 2 + wave;
    ctx.lineTo(fx, i === segments ? poleTopY : fy);
  }
  ctx.closePath();
  ctx.clip();

  const checkSize = 16;
  for (let cx = 0; cx < flagW + checkSize; cx += checkSize) {
    for (let cy = -flagH; cy < flagH; cy += checkSize) {
      const isDark = (Math.floor(cx / checkSize) + Math.floor((cy + flagH) / checkSize)) % 2 === 0;
      ctx.fillStyle = isDark ? ART.goalFlagA : ART.goalFlagB;
      ctx.fillRect(goalX + cx, poleTopY + cy, checkSize, checkSize);
    }
  }
  ctx.restore();

  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(goalX, poleTopY);
  for (let i = 0; i <= segments; i++) {
    const fx = goalX + (flagW * i) / segments;
    const wave = Math.sin(t + i * 0.8) * 6;
    const fy = poleTopY - flagH / 2 + wave;
    if (i === 0) ctx.moveTo(fx, poleTopY);
    else ctx.lineTo(fx, fy);
  }
  ctx.stroke();

  // Beacon on top
  ctx.fillStyle = ART.anchorColor;
  ctx.beginPath();
  ctx.arc(goalX, poleTopY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2.5;
  ctx.stroke();
}
