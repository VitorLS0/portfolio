import { useEffect, useState } from "react";
import { report, tilt, tiltNeedsPermission } from "../tilt";

// Temporary: add ?tilt-debug to the URL to see what the phone's sensors report.
// Delete this file and its two lines in Work.tsx once the tilt is settled.
export function TiltDebug() {
  const [, render] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => render((n) => n + 1), 250);
    return () => clearInterval(timer);
  }, []);

  const round = (n: number) => n.toFixed(2);

  return (
    <pre
      style={{
        position: "fixed",
        left: 8,
        bottom: 8,
        zIndex: 50,
        margin: 0,
        padding: "8px 10px",
        background: "rgba(0,0,0,0.85)",
        border: "1px solid #c8ff00",
        color: "#c8ff00",
        font: "10px/1.5 monospace",
        pointerEvents: "none",
      }}
    >
      {`gated: ${tiltNeedsPermission()}  perm: ${report.permission}
events: orient ${report.orientation} / abs ${report.absolute} / motion ${report.motion}
beta ${round(report.beta)}  gamma ${round(report.gamma)}
tilt ${round(tilt.x)} , ${round(tilt.y)}  live ${tilt.live}`}
    </pre>
  );
}
