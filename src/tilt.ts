// The phone's own tilt, shared by every model the way the cursor is on desktop
// (see RowObject). Nothing here touches three.js, so the button in the work
// header can reach it without pulling in the 3D chunk.

type Source = typeof DeviceOrientationEvent & {
  /** Safari gates the sensor behind a tap; some others expose this too. */
  requestPermission?: () => Promise<string>;
};

const source = window.DeviceOrientationEvent as Source | undefined;

/** How far the models turn, as -1..1 on each axis. Stays 0 until the phone moves. */
export const tilt = { x: 0, y: 0, live: false };

/** What the sensor is doing, for the ?tilt-debug readout. */
export const report = {
  permission: "not asked",
  orientation: 0,
  absolute: 0,
  motion: 0,
  beta: 0,
  gamma: 0,
};

// Degrees of tilt that reach the full turn.
const RANGE = 30;

// The angle the phone was held at when tracking began, so the models rest where
// the reader is already holding it rather than snapping to some absolute pose.
let base: { beta: number; gamma: number } | null = null;
let listening = false;
// Orientation is the better signal; gravity is only read until one arrives.
let oriented = false;

const clamp = (n: number) => Math.max(-1, Math.min(1, n));
// beta wraps at ±180, where a large step is really a small move the other way.
const wrap = (d: number) => (d > 180 ? d - 360 : d < -180 ? d + 360 : d);

function apply(beta: number, gamma: number) {
  if (!base) base = { beta, gamma };
  report.beta = beta;
  report.gamma = gamma;

  const pitch = wrap(beta - base.beta);
  const roll = wrap(gamma - base.gamma);
  // A rotated screen swaps the axes: in landscape the phone's roll is the
  // reader's pitch.
  const angle = ((screen.orientation?.angle ?? 0) * Math.PI) / 180;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  tilt.x = clamp((pitch * cos - roll * sin) / RANGE);
  tilt.y = clamp((roll * cos + pitch * sin) / RANGE);
  tilt.live = true;
}

function readOrientation(event: DeviceOrientationEvent) {
  if (event.type === "deviceorientation") report.orientation++;
  else report.absolute++;
  const { beta, gamma } = event;
  if (beta === null || gamma === null) return;
  oriented = true;
  apply(beta, gamma);
}

// For phones that report no orientation at all: gravity alone gives both angles
// we use, and every accelerometer reports it.
function readGravity(event: DeviceMotionEvent) {
  report.motion++;
  if (oriented) return;
  const g = event.accelerationIncludingGravity;
  if (!g || g.x === null || g.y === null || g.z === null) return;
  // Gravity in the phone's own frame is world-up: its angles are beta and gamma.
  const degrees = 180 / Math.PI;
  apply(Math.atan2(g.y, g.z) * degrees, Math.atan2(-g.x, g.z) * degrees);
}

// Turning the phone moves beta and gamma bodily; the old rest angle is meaningless.
const recalibrate = () => {
  base = null;
};

function attach() {
  window.addEventListener("deviceorientation", readOrientation);
  window.addEventListener("deviceorientationabsolute", readOrientation);
  window.addEventListener("devicemotion", readGravity);
  screen.orientation?.addEventListener("change", recalibrate);
}

/** True where the sensor is gated behind a prompt, so it needs a tap to ask. */
export const tiltNeedsPermission = () =>
  typeof source?.requestPermission === "function";

/**
 * Starts tracking. The listeners go on first and stay on: they cost nothing
 * while the sensor is quiet, so a browser that answers the permission call
 * oddly — or not at all — still gets through once it decides to report.
 */
export async function startTilt() {
  if (listening) return;
  listening = true;
  attach();
  if (!source?.requestPermission) return;
  try {
    // Fired without awaiting anything first, so it still counts as being
    // inside the tap that asked for it.
    report.permission = await source.requestPermission();
  } catch (error) {
    report.permission = `failed: ${error}`;
  }
  // Safari only starts delivering after the grant; re-adding is a no-op.
  attach();
}
