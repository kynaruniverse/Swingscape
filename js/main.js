const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);

const world = createWorld();
const FLOOR_Y_OFFSET = 40;
const GRAB_RADIUS = 220;

let player = createPlayer(300, 400);
let camera = { x: 0 };
let lastTime = performance.now();
let respawnX = 0;
let isPointerDown = false;
let pointer = {
  x: 0,
  y: 0,
  active: false
};

function screenToWorld(sx, sy) {
  return {
    x: sx + camera.x,
    y: sy
  };
}

function distanceToAnchor(player, anchor) {
  return Math.hypot(
    player.x - anchor.x,
    player.y - anchor.y
  );
}

function attemptAttach(screenX, screenY, radius) {
  const worldPos =
    screenToWorld(screenX, screenY);

  const anchor =
    findNearestAnchor(
      world,
      worldPos.x,
      worldPos.y,
      radius
    );

  if (!anchor) {
    return false;
  }

  // Don't immediately reconnect to the anchor we just released from.
  if (
    player.lastReleasedAnchor === anchor &&
    player.ignoreAnchorTimer > 0
  ) {
    return false;
  }

  return attachToAnchor(player, anchor);
}

function attemptAutoCatch() {
  if (!isPointerDown) {
    return false;
  }

  if (
    player.ignoreAnchorTimer > 0 ||
    player.anchorCooldown > 0
  ) {
    return false;
  }

  const anchor =
    findNearestAnchor(
      world,
      player.x,
      player.y,
      PHYSICS.autoCatchRadius
    );

  if (!anchor) {
    return false;
  }

  if (anchor === player.lastReleasedAnchor) {
    return false;
  }

  return attachToAnchor(player, anchor);
}

function release() {
  if (player.attached) {
    releaseSwing(player, 'manual');
  }
}

function respawn() {
  player.x = respawnX + 50;
  player.y = 300;
  player.vx = 0;
  player.vy = 0;

  player.anchor = null;
  player.ropeLength = 0;
  player.angularVelocity = 0;
  player.lastReleasedAnchor = null;
  player.ignoreAnchorTimer = 0;

  setRopeState(
    player,
    ROPE_STATES.FREE
  );

  player.saveWindowActive = false;
  player.saveWindowTimeLeft = 0;
}

canvas.addEventListener('pointerdown', (e) => {
  isPointerDown = true;

  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.active = true;

  if (!player.attached) {
    const radius =
      player.saveWindowActive
        ? PHYSICS.saveWindowRadius
        : GRAB_RADIUS;

    attemptAttach(
      e.clientX,
      e.clientY,
      radius
    );
  } else {
    // Tapping another anchor while already attached switches the
    // rope without throwing away the current momentum.
    const target =
      findNearestAnchor(
        world,
        screenToWorld(e.clientX, e.clientY).x,
        e.clientY,
        GRAB_RADIUS
      );

    if (
      target &&
      target !== player.anchor &&
      player.anchorCooldown <= 0
    ) {
      switchAnchor(player, target);
    }
  }
});

canvas.addEventListener('pointermove', (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
});

canvas.addEventListener('pointerup', () => {
  isPointerDown = false;
  pointer.active = false;

  release();
});

canvas.addEventListener('pointercancel', () => {
  isPointerDown = false;
  pointer.active = false;

  release();
});

function floorY() {
  return canvas.height - FLOOR_Y_OFFSET;
}

function updateTimers(dt) {
  if (player.ignoreAnchorTimer > 0) {
    player.ignoreAnchorTimer -= dt;

    if (player.ignoreAnchorTimer <= 0) {
      player.ignoreAnchorTimer = 0;
      player.lastReleasedAnchor = null;
    }
  }

  if (player.anchorCooldown > 0) {
    player.anchorCooldown -= dt;
  }
}

function loop(now) {
  const dt =
    Math.min(
      (now - lastTime) / 1000,
      0.033
    );

  lastTime = now;

  updateTimers(dt);

  player.prevX = player.x;
  player.prevY = player.y;

  // Save-window slow motion applies to gameplay physics, but its
  // countdown remains real-time.
  const effectiveDt =
    player.saveWindowActive
      ? dt * PHYSICS.saveWindowSlowMo
      : dt;

  updateMovingObstacles(
    world,
    dt
  );

  // Soft hazard collision.
  const hazardHit =
    checkSoftHazardCollision(
      world,
      player,
      floorY()
    );

  if (
    hazardHit &&
    !player.attached
  ) {
    const knockbackForce = 500;

    player.vx =
      hazardHit.x * knockbackForce;

    player.vy =
      -knockbackForce * 0.6;
  }

  if (player.attached) {
    updateRopeState(
      player,
      player.anchor,
      effectiveDt,
      isPointerDown
    );
  } else {
    updateFreeFlight(
      player,
      effectiveDt
    );

    // Holding the pointer gives the player an opportunity to
    // automatically catch an anchor as they fly past it.
    attemptAutoCatch();
  }

  if (
    !player.attached &&
    player.y > floorY()
  ) {
    if (isOverGap(world, player.x)) {

      if (!player.saveWindowActive) {
        player.saveWindowActive = true;
        player.saveWindowTimeLeft =
          PHYSICS.saveWindowDuration;
      } else {
        player.saveWindowTimeLeft -= dt;

        if (
          player.saveWindowTimeLeft <= 0
        ) {
          respawn();
        }
      }

    } else {
      player.y = floorY();
      player.vy = 0;
      player.saveWindowActive = false;
    }

  } else if (player.attached) {
    player.saveWindowActive = false;
  }

  const candidateCheckpoint =
    getLastCheckpointX(
      world,
      player.x
    );

  if (
    candidateCheckpoint > respawnX
  ) {
    respawnX = candidateCheckpoint;
  }

  if (player.x >= world.goalX) {
    respawnX = 0;

    player.x = 300;
    player.y = 400;
    player.vx = 0;
    player.vy = 0;

    player.anchor = null;
    player.ropeLength = 0;
    player.lastReleasedAnchor = null;
    player.ignoreAnchorTimer = 0;

    setRopeState(
      player,
      ROPE_STATES.FREE
    );
  }

  camera.x =
    player.x -
    canvas.width * 0.35;

  render();

  requestAnimationFrame(loop);
}

function render() {
  drawCityBackdrop(ctx, canvas.width, canvas.height, camera.x);

  // Strong visual tell for the save window.
  if (player.saveWindowActive) {
    ctx.fillStyle =
      'rgba(224, 90, 60, 0.18)';

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  ctx.save();
  ctx.translate(
    -camera.x,
    0
  );

  ctx.fillStyle =
    '#d8cfc0';

  let prevEnd =
    camera.x - 100;

  const sortedGaps =
    [...world.gaps].sort(
      (a, b) =>
        a.startX - b.startX
    );

  for (const gap of sortedGaps) {
    ctx.fillRect(
      prevEnd,
      floorY(),
      gap.startX - prevEnd,
      200
    );

    prevEnd = gap.endX;
  }

  ctx.fillRect(
    prevEnd,
    floorY(),
    camera.x +
      canvas.width +
      100 -
      prevEnd,
    200
  );

  // Anchors.
  for (const anchor of world.anchors) {
    const isCurrent =
      player.anchor === anchor;

    ctx.fillStyle =
      isCurrent
        ? '#e05a3c'
        : '#4a90a4';

    ctx.beginPath();

    ctx.arc(
      anchor.x,
      anchor.y,
      isCurrent ? 10 : 8,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  // Hazard strips.
  ctx.fillStyle =
    'rgba(200, 70, 60, 0.55)';

  for (const strip of world.hazardStrips) {
    if (strip.type === 'ground') {
      ctx.fillRect(
        strip.startX,
        floorY() - 30,
        strip.endX - strip.startX,
        30
      );
    } else {
      ctx.fillRect(
        strip.startX,
        strip.y,
        strip.endX - strip.startX,
        strip.height
      );
    }
  }

  // Moving obstacles.
  ctx.fillStyle =
    '#7a6a55';

  for (const obs of world.movingObstacles) {
    ctx.fillRect(
      obs.x,
      obs.y,
      obs.width,
      obs.height
    );
  }

  // Goal.
  ctx.fillStyle =
    '#e0b23c';

  ctx.fillRect(
    world.goalX - 4,
    floorY() - 200,
    8,
    200
  );

  drawRope(
    ctx,
    player
  );

  drawPlayer(
    ctx,
    player
  );

  // Save-window mercy indicator.
  if (player.saveWindowActive) {
    const alpha =
      player.saveWindowTimeLeft /
      PHYSICS.saveWindowDuration;

    ctx.strokeStyle =
      `rgba(224, 90, 60, ${alpha * 0.6})`;

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.arc(
      player.x,
      player.y,
      PHYSICS.saveWindowRadius,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  }

  ctx.restore();
}

requestAnimationFrame(loop);
