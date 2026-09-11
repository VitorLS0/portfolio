import type { Lang, ModelStyle } from "./content";

// ────────────────────────────────────────────────────────────────────────────
export const identity = {
  name: "Vítor Stahlberg",
  // Used by the header wordmark: initials collapse/expand from this.
  fullName: "Vítor Lagares Stahlberg",
  email: "vitorlberg@gmail.com",
  github: "https://github.com/VitorLS0",
  linkedin: "https://www.linkedin.com/in/vitor-stahlberg/",
  resume: "/resume-en.pdf",
};
// ────────────────────────────────────────────────────────────────────────────

export const settings = {
  defaultLang: "en" as Lang,
  showNumbers: false,
  // "01 / 03" counter in the screenshot reel's caption.
  showReelCount: false,
  singleOpen: true,
  timeZone: "America/Sao_Paulo",
  // Hover model for projects that don't set their own `model`.
  defaultModel: "/the_thinker_by_auguste_rodin.glb",
  // "original" keeps each model's own materials; "outline" draws it flat
  // black, inked in `outlineColor`. A project can override it.
  modelStyle: "outline" as ModelStyle,
  outlineColor: "#f2f2ef",
};
