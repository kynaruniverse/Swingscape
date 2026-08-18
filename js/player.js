function createPlayer(x, y) {
  return {
    x,
    y,
    prevX: x,
    prevY: y,

    vx: 0,
    vy: 0,

    angularVelocity: 0,

    ropeLength: 0,
    ropeState: ROPE_STATES.FREE,
    attached: false,
    anchor: null,

    ropeStateTimer: 0,
    anchorCooldown: 0,
    ignoreAnchorTimer: 0,
    lastReleasedAnchor: null,
    releaseReason: null,

    ropeVisualLength: 0,

    saveWindowActive: false,
    saveWindowTimeLeft: 0,

    // Bold, high-contrast accent color per the visual style decision —
    // needs to read clearly against the silhouette city backdrop.
    color: '#ff4d3d',
    outlineColor: '#1a1a1a'
  };
}

// Chalky/sketch line quality: a slightly imperfect double-stroke
// instead of one clean line. Cheap procedural stand-in for real
// hand-drawn sprites, per the hybrid visual-art decision.
function sketchLine(ctx, x1, y1, x2, y2, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Second, very slightly offset pass — reads as a rough/sketched
  // edge rather than a razor-clean vector line.
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = width * 0.6;
  ctx.beginPath();
  ctx.moveTo(x1 + 1, y1 - 1);
  ctx.lineTo(x2 + 1, y2 - 1);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawPlayer(ctx, player) {
  const r = 15;

  // Outline pass first (dark, thick) then color pass on top —
  // gives the bold high-contrast "pops off the backdrop" look.
  drawStickFigure(ctx, player, r, player.outlineColor, 7);
  drawStickFigure(ctx, player, r, player.color, 4);
}

function drawStickFigure(ctx, player, r, color, width) {
  // Head
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(player.x, player.y - r * 2, r, 0, Math.PI * 2);
  ctx.stroke();

  // Body
  sketchLine(ctx, player.x, player.y - r, player.x, player.y + r, width, color);

  // Arms lean toward the anchor when attached, or flail with speed
  // direction otherwise — keeps the "motion is the character" rule
  // from the Design Bible.
  let armAngle = Math.PI / 2;

  if (player.attached && player.anchor) {
    armAngle = Math.atan2(
      player.anchor.y - player.y,
      player.anchor.x - player.x
    );
  } else if (Math.abs(player.vx) > 80) {
    armAngle = player.vx > 0 ? 0 : Math.PI;
  }

  sketchLine(
    ctx,
    player.x, player.y - r * 0.6,
    player.x + Math.cos(armAngle) * r * 1.6,
    player.y - r * 0.6 + Math.sin(armAngle) * r * 1.6,
    width, color
  );

  // Legs — a little splay increases with speed for a bouncy,
  // arcade-energy feel rather than a static pose.
  const speed = Math.hypot(player.vx || 0, player.vy || 0);
  const splay = Math.min(0.7 + speed / 1400, 1.3);

  sketchLine(
    ctx, player.x, player.y + r,
    player.x - r * splay, player.y + r * 2,
    width, color
  );
  sketchLine(
    ctx, player.x, player.y + r,
    player.x + r * splay, player.y + r * 2,
    width, color
  );
}

function drawRope(ctx, player) {
  if (!player.attached || !player.anchor) {
    return;
  }

  const anchor = player.anchor;

  const dx = player.x - anchor.x;
  const dy = player.y - anchor.y;
  const distance = Math.hypot(dx, dy);

  const ropeLength = player.ropeLength || distance;

  const isSlack =
    player.ropeState === ROPE_STATES.SLACK ||
    distance < ropeLength - PHYSICS.slackTolerance;

  ctx.strokeStyle =
    player.ropeState === ROPE_STATES.REELING ? '#1a1a1a' : '#2b2b2b';

  ctx.lineWidth = player.ropeState === ROPE_STATES.REELING ? 2.5 : 2;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(player.x, player.y - 28);

  if (!isSlack) {
    ctx.lineTo(anchor.x, anchor.y);
  } else {
    const mx = (player.x + anchor.x) * 0.5;
    const my = (player.y + anchor.y) * 0.5;
    const length = Math.max(distance, 1);
    const nx = -(player.y - anchor.y) / length;
    const ny = (player.x - anchor.x) / length;

    ctx.quadraticCurveTo(
      mx + nx * PHYSICS.slackSag,
      my + ny * PHYSICS.slackSag,
      anchor.x, anchor.y
    );
  }

  ctx.stroke();
}
