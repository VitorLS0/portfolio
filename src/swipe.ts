// How far a finger has turned the models, shared by every one of them the way
// the cursor is on desktop (see RowObject). Work drives it from the project
// list; keeping it in its own module leaves three.js out of the main bundle.

/** -1..1, added to the models' rest pose. Stays 0 until a finger drags. */
export const swipe = { y: 0, live: false };

// Dragging across this much of the screen covers the whole turn.
const SPAN = 0.5;

let last: number | null = null;

export function dragFrom(x: number) {
  last = x;
}

export function dragTo(x: number) {
  if (last === null) return;
  const span = window.innerWidth * SPAN;
  swipe.y = Math.max(-1, Math.min(1, swipe.y + (x - last) / span));
  swipe.live = true;
  last = x;
}

export function dragEnd() {
  last = null;
}
