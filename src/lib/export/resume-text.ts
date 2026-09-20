import type { GeneratedResume } from "../types";

/** Constrói o texto puro do currículo, no formato ATS, no idioma do conteúdo. */
export function resumeToAtsText(resume: GeneratedResume, labels?: {
  summary: string; experience: string; education: string; skills: string;
  certifications: string; languages: string;
}): string {
  const L = labels ?? {
    summary: "Resumo Profissional",
    experience: "Experiência Profissional",
    education: "Formação Acadêmica",
    skills: "Habilidades",
    certifications: "Certificações",
    languages: "Idiomas",
  };
  const lines: string[] = [];
  lines.push(resume.name.toUpperCase());
  const contact = [resume.city, resume.email, resume.phone, resume.linkedin].filter(Boolean).join(" | ");
  if (contact) lines.push(contact);
  lines.push("");
  if (resume.summary) {
    lines.push(L.summary.toUpperCase());
    lines.push(resume.summary);
    lines.push("");
  }
  if (resume.experience.length > 0) {
    lines.push(L.experience.toUpperCase());
    for (const exp of resume.experience) {
      lines.push(`${exp.role} — ${exp.company} (${exp.period})`);
      for (const b of exp.bullets) lines.push(`• ${b.text}`);
      lines.push("");
    }
  }
  if (resume.education.length > 0) {
    lines.push(L.education.toUpperCase());
    for (const edu of resume.education) lines.push(`${edu.degree} — ${edu.institution} (${edu.period})`);
    lines.push("");
  }
  if (resume.skills.length > 0) {
    lines.push(L.skills.toUpperCase());
    lines.push(resume.skills.map((s) => s.name).join(" • "));
    lines.push("");
  }
  if (resume.certifications.length > 0) {
    lines.push(L.certifications.toUpperCase());
    for (const c of resume.certifications) lines.push(`• ${c.name}`);
    lines.push("");
  }
  if (resume.languages.length > 0) {
    lines.push(L.languages.toUpperCase());
    lines.push(resume.languages.map((l) => `${l.name} — ${l.level}`).join(" • "));
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Nome do arquivo: Nome_Sobrenome_Titulo-da-vaga */
export function exportFileName(resume: GeneratedResume, jobTitle: string | null, ext: string): string {
  const clean = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_");
  const nameParts = clean(resume.name || "Curriculo").split("_");
  const firstLast = [nameParts[0], nameParts.length > 1 ? nameParts[nameParts.length - 1] : ""]
    .filter(Boolean)
    .join("_");
  const title = jobTitle ? clean(jobTitle).replace(/_/g, "-") : "vaga";
  return `${firstLast}_${title}.${ext}`;
}

/** Dispara download de um Blob; usa compartilhamento do sistema quando disponível. */
export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: blob.type });
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean; share?: (d: { files: File[] }) => Promise<void> };
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file] });
      return;
    } catch {
      // usuário cancelou ou compartilhamento falhou: cai para download
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
