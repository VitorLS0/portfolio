import type { Lang } from "./content";

// ────────────────────────────────────────────────────────────────────────────
export const identity = {
  name: "Vítor Stahlberg",
  // Used by the header wordmark: initials collapse/expand from this.
  fullName: "Vítor Lagares Stahlberg",
  email: "your.email@example.com",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  resume: "/resume-en.pdf",
};
// ────────────────────────────────────────────────────────────────────────────

export const settings = {
  defaultLang: "en" as Lang,
  showNumbers: true,
  singleOpen: true,
  timeZone: "America/Sao_Paulo",
  // Hover model for projects that don't set their own `model`.
  defaultModel: "/the_thinker_by_auguste_rodin.glb",
};
