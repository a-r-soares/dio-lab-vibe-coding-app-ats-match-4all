import type { GeneratedResume } from "../types";
import { exportFileName, downloadBlob } from "./resume-text";

/**
 * PDF A4 com texto REAL e selecionável (vetorial) — nunca imagem/canvas.
 * Importado dinamicamente (somente navegador).
 */
export async function exportResumePdf(resume: GeneratedResume, jobTitle: string | null): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > 297 - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeLines = (text: string, size: number, style: "normal" | "bold" = "normal", gap = 1.6) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(text, maxW) as string[];
    for (const line of lines) {
      ensureSpace(size * 0.45);
      doc.text(line, margin, y);
      y += size * 0.42 + gap;
    }
  };

  const section = (title: string) => {
    ensureSpace(12);
    y += 2;
    writeLines(title.toUpperCase(), 11, "bold", 0.5);
    doc.setDrawColor(120, 120, 120);
    doc.line(margin, y - 1.5, pageW - margin, y - 1.5);
    y += 1;
  };

  // Cabeçalho em texto simples no topo
  writeLines(resume.name, 16, "bold", 1);
  const contact = [resume.city, resume.email, resume.phone, resume.linkedin].filter(Boolean).join(" | ");
  if (contact) writeLines(contact, 10);

  if (resume.summary) {
    section("Resumo Profissional");
    writeLines(resume.summary, 10.5);
  }
  if (resume.experience.length > 0) {
    section("Experiência Profissional");
    for (const exp of resume.experience) {
      writeLines(`${exp.role} — ${exp.company}`, 10.5, "bold", 0.4);
      writeLines(exp.period, 10);
      for (const b of exp.bullets) writeLines(`•  ${b.text}`, 10.5);
      y += 1.5;
    }
  }
  if (resume.education.length > 0) {
    section("Formação Acadêmica");
    for (const edu of resume.education) {
      writeLines(`${edu.degree} — ${edu.institution} (${edu.period})`, 10.5);
    }
  }
  if (resume.skills.length > 0) {
    section("Habilidades");
    writeLines(resume.skills.map((s) => s.name).join(" • "), 10.5);
  }
  if (resume.certifications.length > 0) {
    section("Certificações");
    for (const c of resume.certifications) writeLines(`•  ${c.name}`, 10.5);
  }
  if (resume.languages.length > 0) {
    section("Idiomas");
    writeLines(resume.languages.map((l) => `${l.name} — ${l.level}`).join(" • "), 10.5);
  }

  const blob = doc.output("blob");
  await downloadBlob(new Blob([blob], { type: "application/pdf" }), exportFileName(resume, jobTitle, "pdf"));
}
