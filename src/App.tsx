import { useState } from "react";
import type { Lang } from "./content";
import { Header } from "./components/Header";
import { WipBanner } from "./components/WipBanner";
import { Hero } from "./components/Hero";
import { Work } from "./components/Work";
import { Info } from "./components/Info";
import { Footer } from "./components/Footer";
import { settings } from "./site.config";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const [lang, setLang] = useState<Lang>(settings.defaultLang);

  return (
    <div className="page" lang={lang}>
      <Header lang={lang} onLangChange={setLang} />
      <WipBanner lang={lang} />
      <Hero lang={lang} />
      <Work lang={lang} />
      <Info lang={lang} />
      <Footer lang={lang} />
      <Analytics />
    </div>
  );
}
