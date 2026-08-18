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

    // Used to make the rope render smoothly while its physical state
    // changes between taut and slack.
    ropeVisualLength: 0,

    saveWindowActive: false,
    saveWindowTimeLeft: 0,

    color: '#e05a3c'
  };
}

function drawPlayer(ctx, player) {
  const r = 14;

  ctx.strokeStyle = player.color;
  ctx.fillStyle = player.color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Head
  ctx.beginPath();
  ctx.arc(
    player.x,
    player.y - r * 2,
    r,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - r);
  ctx.lineTo(player.x, player.y + r);
  ctx.stroke();

  // Arms lean toward the anchor when attached.
  let armAngle = Math.PI / 2;

  if (player.attached && player.anchor) {
    armAngle = Math.atan2(
      player.anchor.y - player.y,
      player.anchor.x - player.x
    );
  } else if (Math.abs(player.vx) > 80) {
    armAngle =
      player.vx > 0 ? 0 : Math.PI;
  }

  ctx.beginPath();
  ctx.moveTo(
    player.x,
    player.y - r * 0.6
  );
  ctx.lineTo(
    player.x +
      Math.cos(armAngle) * r * 1.5,
    player.y -
      r * 0.6 +
      Math.sin(armAngle) * r * 1.5
  );
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(
    player.x,
    player.y + r
  );
  ctx.lineTo(
    player.x - r * 0.7,
    player.y + r * 2
  );

  ctx.moveTo(
    player.x,
    player.y + r
  );
  ctx.lineTo(
    player.x + r * 0.7,
    player.y + r * 2
  );
  ctx.stroke();
}

function drawRope(ctx, player) {
  if (!player.attached || !player.anchor) {
    return;
  }

  const anchor = player.anchor;

  const dx = player.x - anchor.x;
  const dy = player.y - anchor.y;
  const distance = Math.hypot(dx, dy);

  const ropeLength =
    player.ropeLength || distance;

  const isSlack =
    player.ropeState === ROPE_STATES.SLACK ||
    distance <
      ropeLength - PHYSICS.slackTolerance;

  ctx.strokeStyle =
    player.ropeState === ROPE_STATES.REELING
      ? '#222'
      : '#333';

  ctx.lineWidth =
    player.ropeState === ROPE_STATES.REELING
      ? 2.5
      : 2;

  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(
    player.x,
    player.y - 28
  );

  if (!isSlack) {
    ctx.lineTo(anchor.x, anchor.y);
  } else {
    // A small sag makes slack visible instead of simply looking
    // like a shorter taut rope.
    const mx =
      (player.x + anchor.x) * 0.5;

    const my =
      (player.y + anchor.y) * 0.5;

    const length =
      Math.max(distance, 1);

    const nx =
      -(player.y - anchor.y) / length;

    const ny =
      (player.x - anchor.x) / length;

    ctx.quadraticCurveTo(
      mx + nx * PHYSICS.slackSag,
      my + ny * PHYSICS.slackSag,
      anchor.x,
      anchor.y
    );
  }

  ctx.stroke();
}
