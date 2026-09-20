export type Mode = "geral" | "tecnologia" | "primeiro_emprego";

export type KeywordCategory =
  | "hard_skill"
  | "ferramenta"
  | "soft_skill"
  | "certificacao"
  | "idioma"
  | "senioridade";

export type Importance = "essencial" | "desejavel";

export interface Keyword {
  term: string;
  category: KeywordCategory;
  importance: Importance;
  synonyms: string[];
  found: boolean;
  evidence: string | null;
  declared?: boolean;
  declaredText?: string;
}

export interface ResumeBullet {
  text: string;
  source_evidence: string;
}

export interface ResumeExperience {
  company: string;
  role: string;
  period: string;
  bullets: ResumeBullet[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  period: string;
}

export interface ResumeSkill {
  name: string;
  source_evidence: string;
  declared?: boolean;
}

export interface ResumeCertification {
  name: string;
  source_evidence: string;
}

export interface ResumeLanguage {
  name: string;
  level: string;
}

export interface GeneratedResume {
  name: string;
  city: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  certifications: ResumeCertification[];
  languages: ResumeLanguage[];
}

export interface ChangeLog {
  section: string;
  before: string;
  after: string;
  reason: string;
}

export interface FidelityFlag {
  item: string;
  reason: string;
}

export interface AtsChecklistItem {
  label: string;
  ok: boolean;
}

export interface DeclaredItem {
  keyword: string;
  description: string;
}

export interface AnalysisResult {
  keywords: Keyword[];
  scoreBefore: number;
  scoreAfter: number;
  checklist: AtsChecklistItem[];
  resume: GeneratedResume;
  changes: ChangeLog[];
  fidelityFlags: FidelityFlag[];
}

export const CATEGORY_LABELS: Record<KeywordCategory, string> = {
  hard_skill: "Hard skill",
  ferramenta: "Ferramenta/Tecnologia",
  soft_skill: "Soft skill",
  certificacao: "Certificação/Formação",
  idioma: "Idioma",
  senioridade: "Senioridade",
};

export const MODE_LABELS: Record<Mode, string> = {
  geral: "Geral",
  tecnologia: "Tecnologia",
  primeiro_emprego: "Primeiro emprego",
};
