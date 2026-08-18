function createWorld() {
  return {
    anchors: [
      { x: 500, y: 150 },
      { x: 850, y: 220 },
      { x: 1200, y: 130 },
      { x: 1550, y: 260 },
      { x: 1900, y: 160 },
      { x: 2250, y: 200 },
      { x: 2600, y: 140 }
    ],
    gaps: [
      { startX: 700, endX: 780 },
      { startX: 1400, endX: 1500 },
      { startX: 2050, endX: 2150 }
    ],
    // Hazard strips: softer than gaps, per design — touching knocks
    // the player back rather than failing the level.
    // type: 'ground' sits on the floor; 'floating' is a mid-air zone.
    hazardStrips: [
      { type: 'ground', startX: 950, endX: 1050, y: null },
      { type: 'floating', startX: 1650, endX: 1780, y: 200, height: 60 },
      { type: 'floating', startX: 2350, endX: 2480, y: 120, height: 80 }
    ],
    // Sliding platform: moves back and forth along the x-axis between
    // rangeStart/rangeEnd. Also acts as a hazard on contact (soft).
    movingObstacles: [
      {
        type: 'sliding',
        rangeStart: 1150,
        rangeEnd: 1350,
        y: 300,
        width: 90,
        height: 20,
        speed: 120,       // px/sec
        direction: 1,      // 1 = toward rangeEnd, -1 = toward rangeStart
        x: 1150            // current position, updated at runtime
      }
    ],
    checkpointInterval: 600,
    goalX: 2900
  };
}

function findNearestAnchor(world, worldX, worldY, maxRadius) {
  let closest = null;
  let closestDist = Infinity;
  for (const anchor of world.anchors) {
    const dx = anchor.x - worldX;
    const dy = anchor.y - worldY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < maxRadius && dist < closestDist) {
      closest = anchor;
      closestDist = dist;
    }
  }
  return closest;
}

function isOverGap(world, x) {
  return world.gaps.some(g => x >= g.startX && x <= g.endX);
}

function getLastCheckpointX(world, playerX) {
  const interval = world.checkpointInterval;
  return Math.floor(playerX / interval) * interval;
}

// Updates sliding platforms — call once per frame.
function updateMovingObstacles(world, dt) {
  for (const obs of world.movingObstacles) {
    if (obs.type !== 'sliding') continue;
    obs.x += obs.speed * obs.direction * dt;
    if (obs.x >= obs.rangeEnd) {
      obs.x = obs.rangeEnd;
      obs.direction = -1;
    } else if (obs.x <= obs.rangeStart) {
      obs.x = obs.rangeStart;
      obs.direction = 1;
    }
  }
}

// Checks collision between the player and any hazard strip or moving
// obstacle. Returns a knockback vector {x, y} if hit, otherwise null.
// This is soft-hazard collision only — gaps are handled separately
// in main.js since they use the fail/save-window path.
function checkSoftHazardCollision(world, player, floorY) {
  const px = player.x;
  const py = player.y;
  const r = 20; // rough player collision radius

  for (const strip of world.hazardStrips) {
    if (px < strip.startX - r || px > strip.endX + r) continue;
    if (strip.type === 'ground') {
      if (py >= floorY - r) {
        return { x: (player.vx || 0) > 0 ? -1 : 1, y: -1 };
      }
    } else {
      // floating strip occupies a vertical band [y, y+height]
      if (py >= strip.y - r && py <= strip.y + strip.height + r) {
        return { x: (player.vx || 0) > 0 ? -1 : 1, y: -1 };
      }
    }
  }

  for (const obs of world.movingObstacles) {
    if (px < obs.x - r || px > obs.x + obs.width + r) continue;
    if (py >= obs.y - r && py <= obs.y + obs.height + r) {
      return { x: (player.vx || 0) > 0 ? -1 : 1, y: -1 };
    }
  }

  return null;
}