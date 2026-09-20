import type { GeneratedResume } from "@/lib/types";

interface Props {
  resume: GeneratedResume;
  onChange: (resume: GeneratedResume) => void;
}

/**
 * Pré-visualização fiel à exportação: folha A4 branca, Arial ~10,5pt,
 * sempre clara (não herda o tema escuro). Editável campo a campo.
 */
export function ResumePreview({ resume, onChange }: Props) {
  const set = <K extends keyof GeneratedResume>(key: K, value: GeneratedResume[K]) =>
    onChange({ ...resume, [key]: value });

  const field =
    "w-full rounded-sm bg-transparent px-1 -mx-1 outline-none transition-shadow focus:shadow-[0_0_0_2px_#4F46E5] hover:bg-[#4F46E50D]";

  return (
    <div
      className="mx-auto w-full max-w-[640px] bg-white p-6 text-black shadow-lg ring-1 ring-black/10 sm:p-8"
      style={{ fontFamily: "Arial, 'Calibri', sans-serif", fontSize: "10.5pt", lineHeight: 1.45 }}
      role="document"
      aria-label="Pré-visualização do currículo (editável)"
    >
      <input
        className={`${field} text-[16pt] font-bold uppercase tracking-wide`}
        style={{ fontSize: "15pt" }}
        value={resume.name}
        onChange={(e) => set("name", e.target.value)}
        aria-label="Nome completo"
      />
      <input
        className={`${field} mt-1 text-[9.5pt] text-neutral-700`}
        value={[resume.city, resume.email, resume.phone, resume.linkedin].filter(Boolean).join(" | ")}
        onChange={(e) => {
          const parts = e.target.value.split("|").map((p) => p.trim());
          onChange({
            ...resume,
            city: parts[0] ?? "",
            email: parts[1] ?? "",
            phone: parts[2] ?? "",
            linkedin: parts[3] ?? "",
          });
        }}
        aria-label="Contato (cidade, e-mail, telefone, LinkedIn)"
      />

      <SectionTitle>Resumo Profissional</SectionTitle>
      <textarea
        className={`${field} mt-1 resize-y`}
        rows={3}
        value={resume.summary}
        onChange={(e) => set("summary", e.target.value)}
        aria-label="Resumo profissional"
      />

      {resume.experience.length > 0 && (
        <>
          <SectionTitle>Experiência Profissional</SectionTitle>
          {resume.experience.map((exp, i) => (
            <div key={i} className="mt-2">
              <div className="flex flex-wrap items-baseline gap-x-2 font-bold">
                <input
                  className={`${field} w-auto min-w-24 font-bold`}
                  value={exp.role}
                  onChange={(e) => {
                    const next = [...resume.experience];
                    next[i] = { ...exp, role: e.target.value };
                    set("experience", next);
                  }}
                  aria-label={`Cargo ${i + 1}`}
                />
                <span>—</span>
                <input
                  className={`${field} w-auto min-w-24 font-bold`}
                  value={exp.company}
                  onChange={(e) => {
                    const next = [...resume.experience];
                    next[i] = { ...exp, company: e.target.value };
                    set("experience", next);
                  }}
                  aria-label={`Empresa ${i + 1}`}
                />
                <input
                  className={`${field} w-28 text-[9.5pt] font-normal text-neutral-600`}
                  value={exp.period}
                  onChange={(e) => {
                    const next = [...resume.experience];
                    next[i] = { ...exp, period: e.target.value };
                    set("experience", next);
                  }}
                  aria-label={`Período ${i + 1}`}
                />
              </div>
              <ul className="mt-1 list-disc pl-5">
                {exp.bullets.map((b, j) => (
                  <li key={j}>
                    <textarea
                      className={`${field} resize-y`}
                      rows={2}
                      value={b.text}
                      onChange={(e) => {
                        const next = [...resume.experience];
                        const bullets = [...exp.bullets];
                        bullets[j] = { ...b, text: e.target.value };
                        next[i] = { ...exp, bullets };
                        set("experience", next);
                      }}
                      aria-label={`Realização ${j + 1} da experiência ${i + 1}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.education.length > 0 && (
        <>
          <SectionTitle>Formação Acadêmica</SectionTitle>
          {resume.education.map((edu, i) => (
            <input
              key={i}
              className={`${field} mt-1`}
              value={`${edu.degree} — ${edu.institution} (${edu.period})`}
              onChange={(e) => {
                const next = [...resume.education];
                next[i] = { ...edu, degree: e.target.value };
                set("education", next);
              }}
              aria-label={`Formação ${i + 1}`}
            />
          ))}
        </>
      )}

      {resume.skills.length > 0 && (
        <>
          <SectionTitle>Habilidades</SectionTitle>
          <textarea
            className={`${field} mt-1 resize-y`}
            rows={2}
            value={resume.skills.map((s) => s.name).join(" • ")}
            onChange={(e) =>
              set(
                "skills",
                e.target.value
                  .split("•")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((name) => {
                    const existing = resume.skills.find((s) => s.name === name);
                    return existing ?? { name, source_evidence: "Editado pela pessoa", declared: true };
                  }),
              )
            }
            aria-label="Habilidades (separadas por •)"
          />
        </>
      )}

      {resume.certifications.length > 0 && (
        <>
          <SectionTitle>Certificações</SectionTitle>
          {resume.certifications.map((c, i) => (
            <input
              key={i}
              className={`${field} mt-1`}
              value={c.name}
              onChange={(e) => {
                const next = [...resume.certifications];
                next[i] = { ...c, name: e.target.value };
                set("certifications", next);
              }}
              aria-label={`Certificação ${i + 1}`}
            />
          ))}
        </>
      )}

      {resume.languages.length > 0 && (
        <>
          <SectionTitle>Idiomas</SectionTitle>
          <input
            className={`${field} mt-1`}
            value={resume.languages.map((l) => `${l.name} — ${l.level}`).join(" • ")}
            onChange={(e) =>
              set(
                "languages",
                e.target.value
                  .split("•")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((s) => {
                    const [name, level] = s.split("—").map((p) => p.trim());
                    return { name: name ?? s, level: level ?? "" };
                  }),
              )
            }
            aria-label="Idiomas (separados por •)"
          />
        </>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-4 border-b border-neutral-400 pb-0.5 text-[11pt] font-bold uppercase tracking-wide">
      {children}
    </h3>
  );
}
