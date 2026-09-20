import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade — ATS Match 4All" },
      { name: "description", content: "Política de privacidade do ATS Match 4All: o que é salvo e o que nunca é." },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Privacidade</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          Currículos contêm dados pessoais, então tratamos isso com seriedade:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-foreground">Modo convidado:</strong> nada é salvo. A análise acontece e
            o resultado existe apenas na sua tela, até você fechar a página.
          </li>
          <li>
            <strong className="text-foreground">Com conta:</strong> salvamos suas análises (vaga, currículo
            original, resultado) para você acessar o histórico. Só você vê seus dados.
          </li>
          <li>
            <strong className="text-foreground">Nunca:</strong> não usamos seus dados para outra finalidade,
            não vendemos informações e não registramos o conteúdo do currículo em registros técnicos.
          </li>
          <li>
            <strong className="text-foreground">Exclusão:</strong> você pode excluir análises individualmente
            ou apagar a conta inteira (e todos os dados) a qualquer momento, na página Conta e privacidade.
          </li>
          <li>
            O texto da vaga e do currículo é processado por um serviço de IA exclusivamente para gerar a sua
            análise, sem treinar modelos com seus dados.
          </li>
        </ul>
        <p>
          Dúvidas sobre seus dados? Fale com a gente pelo e-mail de suporte informado nos Termos de uso.
        </p>
      </div>
    </div>
  );
}
