import type { GeneratedResume } from "../types";
import { exportFileName, downloadBlob } from "./resume-text";

/** DOCX com estilos reais de título e lista — gerado no navegador. */
export async function exportResumeDocx(resume: GeneratedResume, jobTitle: string | null): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import("docx");

  const body = (text: string, opts?: { bold?: boolean }) =>
    new Paragraph({
      children: [new TextRun({ text, bold: opts?.bold ?? false, font: "Arial", size: 21 })], // 10,5pt
      spacing: { after: 80 },
    });

  const sectionTitle = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: text.toUpperCase(), bold: true, font: "Arial", size: 24 })],
      spacing: { before: 240, after: 120 },
    });

  const bullet = (text: string) =>
    new Paragraph({
      bullet: { level: 0 },
      children: [new TextRun({ text, font: "Arial", size: 21 })],
      spacing: { after: 60 },
    });

  const children = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: resume.name, bold: true, font: "Arial", size: 32 })],
      spacing: { after: 60 },
    }),
    body([resume.city, resume.email, resume.phone, resume.linkedin].filter(Boolean).join(" | ")),
  ];

  if (resume.summary) {
    children.push(sectionTitle("Resumo Profissional"), body(resume.summary));
  }
  if (resume.experience.length > 0) {
    children.push(sectionTitle("Experiência Profissional"));
    for (const exp of resume.experience) {
      children.push(body(`${exp.role} — ${exp.company} (${exp.period})`, { bold: true }));
      for (const b of exp.bullets) children.push(bullet(b.text));
    }
  }
  if (resume.education.length > 0) {
    children.push(sectionTitle("Formação Acadêmica"));
    for (const edu of resume.education) {
      children.push(body(`${edu.degree} — ${edu.institution} (${edu.period})`));
    }
  }
  if (resume.skills.length > 0) {
    children.push(sectionTitle("Habilidades"), body(resume.skills.map((s) => s.name).join(" • ")));
  }
  if (resume.certifications.length > 0) {
    children.push(sectionTitle("Certificações"));
    for (const c of resume.certifications) children.push(bullet(c.name));
  }
  if (resume.languages.length > 0) {
    children.push(sectionTitle("Idiomas"), body(resume.languages.map((l) => `${l.name} — ${l.level}`).join(" • ")));
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });
  const blob = await Packer.toBlob(doc);
  await downloadBlob(blob, exportFileName(resume, jobTitle, "docx"));
}
