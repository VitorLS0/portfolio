export type Lang = 'en' | 'pt'

type Localized<T> = Record<Lang, T>

export type Project = {
  id: number
  year: string
  title: Localized<string>
  description: Localized<string>
  award?: Localized<string>
  tags: Localized<string[]>
}

export const projects: Project[] = [
  {
    id: 1,
    year: '2026',
    title: {
      en: 'Web Accessibility in Government',
      pt: 'Acessibilidade Web no Governo',
    },
    description: {
      en: 'Undergraduate thesis. Automated WCAG and e-MAG audits combined with screen-reader usability testing across five federal service flows. The two most standards-compliant portals had 0% task completion for blind users — automated compliance does not guarantee real accessibility.',
      pt: 'Trabalho de conclusão de curso. Auditorias automatizadas WCAG e e-MAG combinadas com testes de usabilidade com leitores de tela em cinco fluxos de serviços federais. Os dois portais mais aderentes às normas tiveram 0% de conclusão de tarefas por usuários cegos — conformidade automatizada não garante acessibilidade real.',
    },
    tags: {
      en: ['WCAG', 'e-MAG', 'Screen readers'],
      pt: ['WCAG', 'e-MAG', 'Leitores de tela'],
    },
  },
  {
    id: 2,
    year: '2025',
    title: {
      en: 'Transitive Dependency Vulnerabilities',
      pt: 'Vulnerabilidades em Dependências Transitivas',
    },
    description: {
      en: 'Automated analysis of popular open-source Java repositories to map how transitive Maven dependencies introduce vulnerabilities, assessing dependency-management practices and supply-chain mitigation.',
      pt: 'Análise automatizada de repositórios Java populares para mapear como dependências transitivas do Maven introduzem vulnerabilidades, avaliando práticas de gestão de dependências e mitigação na cadeia de suprimentos.',
    },
    award: {
      en: 'Award — Best Interdisciplinary Project, PUC Minas',
      pt: 'Prêmio — Melhor Projeto Interdisciplinar, PUC Minas',
    },
    tags: {
      en: ['Java', 'Maven', 'Supply chain'],
      pt: ['Java', 'Maven', 'Supply chain'],
    },
  },
  {
    id: 3,
    year: '2024',
    title: {
      en: 'LEHSA Lab Management System',
      pt: 'Sistema de Gestão do Laboratório LEHSA',
    },
    description: {
      en: 'Built for the Federal Institute of Sergipe. Replaced spreadsheets, paper forms and informal coordination in a growing hydraulics and sanitation research lab with one system for equipment, scheduling and requests.',
      pt: 'Feito para o Instituto Federal de Sergipe. Substituiu planilhas, formulários em papel e coordenação informal de um laboratório de hidráulica e saneamento por um único sistema de equipamentos, agendamento e solicitações.',
    },
    award: {
      en: 'Award — Best Interdisciplinary Project, PUC Minas',
      pt: 'Prêmio — Melhor Projeto Interdisciplinar, PUC Minas',
    },
    tags: {
      en: ['Scheduling', 'Inventory', 'Client work'],
      pt: ['Agendamento', 'Inventário', 'Cliente real'],
    },
  },
  {
    id: 4,
    year: '2026',
    title: { en: 'Dokmint', pt: 'Dokmint' },
    description: {
      en: 'Cross-platform note organizer for desktop and mobile, with offline-first sync. Built with AI-assisted development.',
      pt: 'Organizador de notas multiplataforma para desktop e mobile, com sincronização offline-first. Desenvolvido com apoio de agentes de IA.',
    },
    tags: {
      en: ['React', 'TypeScript', 'MongoDB', 'PouchDB'],
      pt: ['React', 'TypeScript', 'MongoDB', 'PouchDB'],
    },
  },
  {
    id: 5,
    year: '2025',
    title: {
      en: 'SAtelier — Landing Page Redesign',
      pt: 'SAtelier — Redesign da Landing Page',
    },
    description: {
      en: "Freelance. Redesigned a software company's outdated landing page, keeping the stack deliberately lightweight at the client's request.",
      pt: 'Freelance. Redesign da landing page desatualizada de uma empresa de software, mantendo a stack leve a pedido do cliente.',
    },
    tags: {
      en: ['HTML', 'JavaScript', 'Tailwind'],
      pt: ['HTML', 'JavaScript', 'Tailwind'],
    },
  },
  {
    id: 6,
    year: '2024',
    title: { en: 'Warframe RelicShare', pt: 'Warframe RelicShare' },
    description: {
      en: 'Community platform that helps players coordinate in-game item trades — listings, matching and session planning.',
      pt: 'Plataforma comunitária que ajuda jogadores a coordenar trocas de itens no jogo — anúncios, correspondência e planejamento de sessões.',
    },
    tags: {
      en: ['Next.js', 'Node.js', 'Supabase'],
      pt: ['Next.js', 'Node.js', 'Supabase'],
    },
  },
  {
    id: 7,
    year: '2023',
    title: {
      en: 'Conveyor Belt Wear Detector',
      pt: 'Detector de Desgaste em Correias',
    },
    description: {
      en: 'Hardware prototype for LINK: detects wear on mining conveyor scraper blades, with custom-designed PCBs and C firmware on ESP32.',
      pt: 'Protótipo de hardware para a LINK: detecta desgaste em lâminas raspadoras de correias transportadoras na mineração, com PCBs próprias e firmware em C no ESP32.',
    },
    tags: {
      en: ['ESP32', 'C', 'PCB design'],
      pt: ['ESP32', 'C', 'Projeto de PCB'],
    },
  },
]

type SkillGroup = { label: string; value: string }

type Copy = {
  location: string
  role: string
  bio: string
  facts: { label: string; value: string; accent?: boolean }[]
  workLabel: string
  screenshotLead: string
  screenshotCaption: string
  skillsLabel: string
  skills: SkillGroup[]
  aboutLabel: string
  about: [string, string]
  footerLines: [string, string?]
  links: { email: string; github: string; linkedin: string; resume: string }
  footerLocation: string
}

export const copy: Record<Lang, Copy> = {
  en: {
    location: 'Belo Horizonte, Brazil  /  Available for work',
    role: 'Full-stack developer',
    bio: 'Software Engineering graduate (PUC Minas, 2026). Two years building React and TypeScript frontends for healthcare systems, extending into Node.js backend work.',
    facts: [
      { label: 'Now', value: 'Trainee Dev — Suporte Tecnologias' },
      { label: 'Since', value: 'Sep 2024' },
      { label: 'Awards', value: '2× Best Interdisciplinary Project', accent: true },
    ],
    workLabel: 'Selected work',
    screenshotLead: 'Screenshot 01',
    screenshotCaption: 'Screenshots — 3 slots',
    skillsLabel: 'Skills',
    skills: [
      { label: 'Languages', value: 'TypeScript, JavaScript, Python, C, HTML, CSS' },
      { label: 'Frontend', value: 'React, Next.js, Angular, Vue, Tailwind CSS' },
      { label: 'Backend & data', value: 'Node.js, Supabase, MongoDB, PouchDB' },
      { label: 'Tools', value: 'Git, Linux, Claude Code, OpenCode' },
    ],
    aboutLabel: 'About',
    about: [
      'Trainee developer at Suporte Tecnologias since September 2024, building React and TypeScript interfaces for healthcare systems across several concurrent projects.',
      'Shipped Angular features and Python backend routines by learning both stacks on the job. Twice awarded Best Interdisciplinary Project of the Semester at PUC Minas.',
    ],
    footerLines: ['Open to work'],
    links: { email: 'Email', github: 'GitHub', linkedin: 'LinkedIn', resume: 'Résumé PDF ↓' },
    footerLocation: 'Belo Horizonte, Brazil',
  },
  pt: {
    location: 'Belo Horizonte, Brasil  /  Disponível para trabalho',
    role: 'Desenvolvedor full-stack',
    bio: 'Formado em Engenharia de Software (PUC Minas, 2026). Dois anos construindo interfaces em React e TypeScript para sistemas de saúde, agora avançando para back-end com Node.js.',
    facts: [
      { label: 'Hoje', value: 'Trainee — Suporte Tecnologias' },
      { label: 'Desde', value: 'Set 2024' },
      { label: 'Prêmios', value: '2× Melhor Projeto Interdisciplinar', accent: true },
    ],
    workLabel: 'Projetos selecionados',
    screenshotLead: 'Captura 01',
    screenshotCaption: 'Capturas — 3 espaços',
    skillsLabel: 'Competências',
    skills: [
      { label: 'Linguagens', value: 'TypeScript, JavaScript, Python, C, HTML, CSS' },
      { label: 'Front-end', value: 'React, Next.js, Angular, Vue, Tailwind CSS' },
      { label: 'Back-end & dados', value: 'Node.js, Supabase, MongoDB, PouchDB' },
      { label: 'Ferramentas', value: 'Git, Linux, Claude Code, OpenCode' },
    ],
    aboutLabel: 'Sobre',
    about: [
      'Desenvolvedor trainee na Suporte Tecnologias desde setembro de 2024, construindo interfaces em React e TypeScript para sistemas do setor de saúde em vários projetos simultâneos.',
      'Entreguei funcionalidades em Angular e rotinas de back-end em Python aprendendo ambas as stacks no trabalho. Duas vezes premiado como Melhor Projeto Interdisciplinar do Semestre na PUC Minas.',
    ],
    footerLines: ['Aberto a', 'oportunidades'],
    links: { email: 'E-mail', github: 'GitHub', linkedin: 'LinkedIn', resume: 'Currículo PDF ↓' },
    footerLocation: 'Belo Horizonte, Brasil',
  },
}
