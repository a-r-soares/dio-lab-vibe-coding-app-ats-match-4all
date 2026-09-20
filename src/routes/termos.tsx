import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — ATS Match 4All" },
      { name: "description", content: "Termos de uso do ATS Match 4All." },
    ],
  }),
  component: Termos,
});

function Termos() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Termos de uso</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          O ATS Match 4All ajuda você a apresentar melhor a experiência que já tem. Alguns combinados:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            A ferramenta <strong className="text-foreground">nunca inventa experiência</strong> e pede que
            você inclua apenas o que pode comprovar em uma entrevista.
          </li>
          <li>
            Não prometemos emprego nem aprovação garantida em nenhum processo seletivo. O score é uma
            referência de aderência de palavras-chave, explicada na seção "Como calculamos".
          </li>
          <li>
            Você é responsável pelo conteúdo do seu currículo e pelo uso das versões exportadas.
          </li>
          <li>
            Há limites de uso por hora para manter o serviço disponível para todas as pessoas.
          </li>
          <li>Você pode excluir sua conta e todos os dados a qualquer momento.</li>
        </ul>
      </div>
    </div>
  );
}
