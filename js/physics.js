const ROPE_STATES = Object.freeze({
  FREE: 'FREE',
  ATTACHING: 'ATTACHING',
  SWINGING: 'SWINGING',
  REELING: 'REELING',
  SLACK: 'SLACK',
  RELEASED: 'RELEASED'
});

const PHYSICS = {
  gravity: 1800,
  airDrag: 0.985,
  terminalVelocity: 2600,

  momentumRetention: 0.992,
  maxAngularVelocity: 9.5,
  maxSwingSpeed: 1900,

  // Small stabilisation only. The rope still behaves as a constraint.
  swingAssist: 0.055,

  // Reeling contracts the rope and preserves angular momentum.
  reelSpeed: 420,
  minRopeLength: 105,
  reelMomentumBoost: 1.018,

  // Slack is real: the player may move inside the rope radius.
  slackTolerance: 18,
  slackCatchTolerance: 8,

  // Prevents pathological correction when an anchor is very close.
  maxRopeCorrectionSpeed: 2200,

  releaseMomentum: 1.0,
  releaseBoost: 1.025,

  // New attachment/catch behaviour.
  attachSettleTime: 0.06,
  autoCatchRadius: 125,
  autoCatchCooldown: 0.18,
  anchorSwitchCooldown: 0.10,

  // When the rope is reeled all the way in, release rather than
  // creating a near-zero-radius physics singularity.
  minLengthReleaseMargin: 10,

  // Rope visual behaviour.
  slackSag: 34,
  ropeVisualSmoothing: 0.18,

  saveWindowDuration: 1.2,
  saveWindowRadius: 260,
  saveWindowSlowMo: 0.15,

  velocityDeadZone: 0.5
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSpeed(player) {
  return Math.sqrt(player.vx * player.vx + player.vy * player.vy);
}

function getRopeVector(player, anchor) {
  const dx = player.x - anchor.x;
  const dy = player.y - anchor.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length < 0.0001) {
    return {
      dx: 0, dy: 1, length: 0.0001,
      nx: 0, ny: 1, tx: 1, ty: 0
    };
  }

  const nx = dx / length;
  const ny = dy / length;

  return {
    dx,
    dy,
    length,
    nx,
    ny,
    tx: ny,
    ty: -nx
  };
}

function setRopeState(player, state) {
  player.ropeState = state;

  const attachedStates = [
    ROPE_STATES.ATTACHING,
    ROPE_STATES.SWINGING,
    ROPE_STATES.REELING,
    ROPE_STATES.SLACK
  ];

  player.attached = attachedStates.includes(state);
}

function attachToAnchor(player, anchor) {
  if (!anchor) return false;

  const dx = player.x - anchor.x;
  const dy = player.y - anchor.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < PHYSICS.minRopeLength * 0.45) {
    return false;
  }

  player.anchor = anchor;
  // The initial rope is exactly the distance to the anchor.
  // The minimum length only applies while reeling.
  player.ropeLength = distance;

  const incomingOmega =
    velocityToAngularVelocity(player, anchor);

  player.angularVelocity = incomingOmega;

  player.ropeState = ROPE_STATES.ATTACHING;
  player.attached = true;
  player.ropeStateTimer = PHYSICS.attachSettleTime;
  player.anchorCooldown = PHYSICS.anchorSwitchCooldown;
  player.saveWindowActive = false;
  player.saveWindowTimeLeft = 0;

  // The rope immediately owns the player's radial position.
  constrainToRope(player, anchor, player.ropeLength, true);

  return true;
}

function releaseSwing(player, reason = 'manual') {
  if (!player.anchor && !player.attached) {
    setRopeState(player, ROPE_STATES.RELEASED);
    return;
  }

  // Never throw away the velocity built by the swing.
  const speed = getSpeed(player);
  const boost = speed > 900
    ? PHYSICS.releaseBoost
    : 1;

  player.vx *= PHYSICS.releaseMomentum * boost;
  player.vy *= PHYSICS.releaseMomentum * boost;

  player.lastReleasedAnchor = player.anchor;
  player.ignoreAnchorTimer = PHYSICS.autoCatchCooldown;
  player.ropeLength = 0;
  player.anchor = null;
  player.angularVelocity = 0;
  player.releaseReason = reason;

  setRopeState(player, ROPE_STATES.RELEASED);
}

function switchAnchor(player, anchor) {
  if (!anchor) return false;
  if (player.anchor === anchor) return false;

  const previousSpeed = getSpeed(player);

  const attached = attachToAnchor(player, anchor);

  if (attached) {
    // Preserve a little more momentum when chaining anchors at speed.
    const chainBoost = previousSpeed > 750 ? 1.015 : 1;
    player.vx *= chainBoost;
    player.vy *= chainBoost;
  }

  return attached;
}

function updateRopeState(player, anchor, dt, isReeling) {
  if (!anchor) {
    setRopeState(player, ROPE_STATES.FREE);
    return;
  }

  dt = Math.min(dt, 0.033);

  if (player.anchorCooldown > 0) {
    player.anchorCooldown -= dt;
  }

  if (player.ropeStateTimer > 0) {
    player.ropeStateTimer -= dt;
  }

  // ATTACHING is deliberately brief. It prevents a newly attached
  // rope from instantly fighting a large incoming radial velocity.
  if (player.ropeState === ROPE_STATES.ATTACHING) {
    constrainToRope(player, anchor, player.ropeLength, true);

    if (player.ropeStateTimer <= 0) {
      setRopeState(
        player,
        isReeling
          ? ROPE_STATES.REELING
          : ROPE_STATES.SWINGING
      );
    }

    return;
  }

  if (player.ropeState === ROPE_STATES.SLACK) {
    updateSlackRope(player, anchor, dt, isReeling);
    return;
  }

  // Reeling is a state, not just a boolean. This makes transitions
  // deterministic and keeps rope shortening separate from swing motion.
  if (isReeling) {
    setRopeState(player, ROPE_STATES.REELING);
  } else if (player.ropeState === ROPE_STATES.REELING) {
    setRopeState(player, ROPE_STATES.SWINGING);
  }

  if (player.ropeState === ROPE_STATES.REELING) {
    const oldLength = player.ropeLength;

    player.ropeLength = Math.max(
      PHYSICS.minRopeLength,
      player.ropeLength - PHYSICS.reelSpeed * dt
    );

    const lengthRatio =
      oldLength / Math.max(player.ropeLength, 1);

    // Angular momentum transfer from a shortening rope.
    const reelFactor =
      Math.pow(lengthRatio, 0.75) *
      PHYSICS.reelMomentumBoost;

    player.vx *= reelFactor;
    player.vy *= reelFactor;

    // If we've reeled all the way in, automatically release instead
    // of allowing a zero-radius singularity.
    const ropeNow = getRopeVector(player, anchor);

    if (
      player.ropeLength <= PHYSICS.minRopeLength + 0.01 &&
      ropeNow.length <= PHYSICS.minRopeLength + PHYSICS.minLengthReleaseMargin
    ) {
      releaseSwing(player, 'rope-too-short');
      return;
    }
  }

  updateTautSwing(player, anchor, dt);

  const distance =
    Math.hypot(
      player.x - anchor.x,
      player.y - anchor.y
    );

  // Once the player moves meaningfully inside the rope radius,
  // the rope loses tension and becomes slack.
  if (
    distance <
    player.ropeLength - PHYSICS.slackTolerance
  ) {
    setRopeState(player, ROPE_STATES.SLACK);
  }
}

function updateTautSwing(player, anchor, dt) {
  const rope = getRopeVector(player, anchor);
  const ropeLength = player.ropeLength;

  const radialVelocity =
    player.vx * rope.nx +
    player.vy * rope.ny;

  let tangentialVelocity =
    player.vx * rope.tx +
    player.vy * rope.ty;

  // Gravity projected onto the rope tangent.
  tangentialVelocity +=
    PHYSICS.gravity * rope.ty * dt;

  tangentialVelocity *= Math.pow(
    PHYSICS.momentumRetention,
    dt * 60
  );

  tangentialVelocity *= Math.pow(
    PHYSICS.airDrag,
    dt * 60
  );

  const maxTangentialVelocity = Math.min(
    PHYSICS.maxSwingSpeed,
    ropeLength * PHYSICS.maxAngularVelocity
  );

  tangentialVelocity = clamp(
    tangentialVelocity,
    -maxTangentialVelocity,
    maxTangentialVelocity
  );

  // Very small correction that damps unwanted radial energy.
  const correctedRadial =
    radialVelocity * PHYSICS.swingAssist;

  player.vx =
    rope.tx * tangentialVelocity +
    rope.nx * correctedRadial;

  player.vy =
    rope.ty * tangentialVelocity +
    rope.ny * correctedRadial;

  player.prevX = player.x;
  player.prevY = player.y;

  player.x += player.vx * dt;
  player.y += player.vy * dt;

  constrainToRope(player, anchor, ropeLength, false);

  const speed = getSpeed(player);

  if (speed > PHYSICS.maxSwingSpeed) {
    const scale =
      PHYSICS.maxSwingSpeed / speed;

    player.vx *= scale;
    player.vy *= scale;
  }

  player.angularVelocity =
    velocityToAngularVelocity(player, anchor);

  if (Math.abs(player.vx) < PHYSICS.velocityDeadZone) {
    player.vx = 0;
  }

  if (Math.abs(player.vy) < PHYSICS.velocityDeadZone) {
    player.vy = 0;
  }
}

function updateSlackRope(player, anchor, dt, isReeling) {
  dt = Math.min(dt, 0.033);

  // Gravity and air drag continue normally while the rope is slack.
  player.prevX = player.x;
  player.prevY = player.y;

  player.vy += PHYSICS.gravity * dt;

  const drag =
    Math.pow(PHYSICS.airDrag, dt * 60);

  player.vx *= drag;
  player.vy *= drag;

  player.vx = clamp(
    player.vx,
    -PHYSICS.terminalVelocity,
    PHYSICS.terminalVelocity
  );

  player.vy = clamp(
    player.vy,
    -PHYSICS.terminalVelocity,
    PHYSICS.terminalVelocity
  );

  if (isReeling) {
    setRopeState(player, ROPE_STATES.REELING);

    player.ropeLength = Math.max(
      PHYSICS.minRopeLength,
      player.ropeLength - PHYSICS.reelSpeed * dt
    );
  }

  player.x += player.vx * dt;
  player.y += player.vy * dt;

  const distance =
    Math.hypot(
      player.x - anchor.x,
      player.y - anchor.y
    );

  // Rope catches again once the player reaches its current length.
  if (
    distance >=
    player.ropeLength - PHYSICS.slackCatchTolerance
  ) {
    constrainToRope(player, anchor, player.ropeLength, true);

    setRopeState(
      player,
      isReeling
        ? ROPE_STATES.REELING
        : ROPE_STATES.SWINGING
    );

    player.angularVelocity =
      velocityToAngularVelocity(player, anchor);

    return;
  }

  // Reeling can shrink the rope until it catches.
  if (isReeling) {
    const minimumSafeDistance =
      PHYSICS.minRopeLength +
      PHYSICS.minLengthReleaseMargin;

    if (distance < minimumSafeDistance &&
        player.ropeLength <= PHYSICS.minRopeLength + 0.01) {
      releaseSwing(player, 'rope-too-short');
    }
  }
}

function constrainToRope(
  player,
  anchor,
  ropeLength,
  hardAttach = false
) {
  const dx = player.x - anchor.x;
  const dy = player.y - anchor.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 0.0001) {
    return;
  }

  if (!hardAttach && distance <= ropeLength) {
    return;
  }

  const nx = dx / distance;
  const ny = dy / distance;

  player.x =
    anchor.x + nx * ropeLength;

  player.y =
    anchor.y + ny * ropeLength;

  // Remove outward velocity. Keep inward/tangential momentum.
  const radialVelocity =
    player.vx * nx +
    player.vy * ny;

  if (radialVelocity > 0 || hardAttach) {
    const correction =
      clamp(
        radialVelocity,
        0,
        PHYSICS.maxRopeCorrectionSpeed
      );

    player.vx -= nx * correction;
    player.vy -= ny * correction;
  }
}

function updateFreeFlight(player, dt) {
  dt = Math.min(dt, 0.033);

  player.prevX = player.x;
  player.prevY = player.y;

  player.vy += PHYSICS.gravity * dt;

  const drag =
    Math.pow(PHYSICS.airDrag, dt * 60);

  player.vx *= drag;
  player.vy *= drag;

  player.vx = clamp(
    player.vx,
    -PHYSICS.terminalVelocity,
    PHYSICS.terminalVelocity
  );

  player.vy = clamp(
    player.vy,
    -PHYSICS.terminalVelocity,
    PHYSICS.terminalVelocity
  );

  player.x += player.vx * dt;
  player.y += player.vy * dt;
}

function velocityToAngularVelocity(player, anchor) {
  const dx = player.x - anchor.x;
  const dy = player.y - anchor.y;

  const distSq =
    dx * dx + dy * dy;

  if (distSq < 0.0001) {
    return 0;
  }

  const omega =
    (dx * player.vy - dy * player.vx) /
    distSq;

  return clamp(
    omega,
    -PHYSICS.maxAngularVelocity,
    PHYSICS.maxAngularVelocity
  );
}

function angularVelocityToVelocity(
  player,
  anchor,
  angularVelocity
) {
  const dx = player.x - anchor.x;
  const dy = player.y - anchor.y;

  const distance = Math.hypot(dx, dy);

  if (distance < 0.0001) {
    return;
  }

  const nx = dx / distance;
  const ny = dy / distance;

  const tx = ny;
  const ty = -nx;

  const tangentialSpeed =
    angularVelocity * distance;

  player.vx = tx * tangentialSpeed;
  player.vy = ty * tangentialSpeed;
}

function getSwingSpeed(player) {
  return getSpeed(player);
}

function getRopeAngle(player, anchor) {
  return Math.atan2(
    player.x - anchor.x,
    player.y - anchor.y
  );
}
