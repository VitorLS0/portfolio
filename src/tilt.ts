// The phone's own tilt, shared by every model the way the cursor is on desktop
// (see RowObject). Nothing here touches three.js, so the permission prompt in
// the hero can reach it without pulling in the 3D chunk.

type Source = typeof DeviceOrientationEvent & {
  /** iOS 13+ only, and only callable from a tap. */
  requestPermission?: () => Promise<"granted" | "denied">;
};

const source = window.DeviceOrientationEvent as Source | undefined;

/** How far the models turn, as -1..1 on each axis. Stays 0 until the phone moves. */
export const tilt = { x: 0, y: 0, live: false };

// Degrees of tilt that reach the full turn.
const RANGE = 30;

// The angle the phone was held at when tracking began, so the models rest where
// the reader is already holding it rather than snapping to some absolute pose.
let base: { beta: number; gamma: number } | null = null;
let listening = false;

const clamp = (n: number) => Math.max(-1, Math.min(1, n));
// beta wraps at ±180, where a large step is really a small move the other way.
const wrap = (d: number) => (d > 180 ? d - 360 : d < -180 ? d + 360 : d);

function read(event: DeviceOrientationEvent) {
  const { beta, gamma } = event;
  if (beta === null || gamma === null) return;
  if (!base) base = { beta, gamma };

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

// Turning the phone moves beta and gamma bodily; the old rest angle is meaningless.
const recalibrate = () => {
  base = null;
};

/** True where the sensor is gated behind a prompt, so it needs a tap to ask. */
export const tiltNeedsPermission = () =>
  typeof source?.requestPermission === "function";

/** Starts tracking, asking first only where the platform requires it. */
export async function startTilt() {
  if (!source || listening) return false;
  if (source.requestPermission) {
    try {
      if ((await source.requestPermission()) !== "granted") return false;
    } catch {
      // Not a tap, or the prompt was dismissed. Either way, no sensor.
      return false;
    }
  }
  listening = true;
  window.addEventListener("deviceorientation", read);
  screen.orientation?.addEventListener("change", recalibrate);
  return true;
}
