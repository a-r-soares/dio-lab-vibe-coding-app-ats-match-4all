<div align="center">

# 🎯 ATS Match 4All

### Cole a vaga, cole o currículo, receba o match e um currículo otimizado que **nunca inventa experiência**.

[![Abrir a aplicação](https://img.shields.io/badge/Abrir%20a%20aplica%C3%A7%C3%A3o-Acessar-4F46E5?style=for-the-badge)](https://match4all-lovable-jobs.lovable.app)

![Feito com Lovable](https://img.shields.io/badge/Feito%20com-Lovable-ff4d8d)
![Prompt por Claude](<https://img.shields.io/badge/Prompt%20por-Claude%20(Anthropic)-d97757>)
![React](https://img.shields.io/badge/React-20232a?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Lovable%20Cloud-Supabase-3ECF8E?logo=supabase&logoColor=white)
![Idioma](https://img.shields.io/badge/Interface-pt--BR-009c3b)

[Sobre](#-sobre-o-projeto) · [Regra inviolável](#-a-regra-inviolável) · [Funcionalidades](#-funcionalidades) · [Origem do projeto](#-como-o-projeto-começou) · [Stack](#-stack-tecnológica) · [Segurança](#-segurança-e-privacidade) · [Testes](#-testes-de-validação) · [Executar](#-como-executar-localmente)

</div>

---

> [!IMPORTANT]
> **Regra inviolável do projeto:** a aplicação melhora **COMO** a pessoa se apresenta. Ela **nunca** cria, infla ou insinua experiência, cargo, empresa, formação, certificação, ferramenta, resultado numérico, senioridade ou período que não esteja no currículo original ou que a pessoa não tenha declarado explicitamente.

🔗 **Aplicação publicada:** [match4all-lovable-jobs.lovable.app](https://match4all-lovable-jobs.lovable.app)

Para que possa **visualizar as telas capturadas** do ATS MATCH 4ALL [clique aqui para acessar](./docs/evidencias/telas-ats-match-4all.md)

## 🎯 Sobre o projeto

Antes de qualquer recrutador ler o seu currículo, um software de triagem, o **ATS** (_Applicant Tracking System_), já o ranqueou. O **ATS Match 4All** mostra como o seu currículo se compara aos requisitos de uma vaga e devolve uma versão ajustada para passar por essa triagem, pronta para exportar.

| Passo | O que acontece                                                                      |
| :---: | ----------------------------------------------------------------------------------- |
|  1️⃣   | Você cola a **descrição da vaga**                                                   |
|  2️⃣   | Você cola o **seu currículo**                                                       |
|  3️⃣   | O app mostra o **match**, as palavras-chave **encontradas** e as que **faltam**     |
|  4️⃣   | O app gera a **versão otimizada** do currículo e você exporta em PDF, DOCX ou texto |

**Contexto:** o projeto nasceu como um desafio do Bootcamp **Riachuelo - Criando Produtos com IA - DIO** de criar um gerador de currículos ATS Friendly com Lovable (o briefing foi escrito com o Claude e o app foi construído no Lovable).

**Público:** pessoas brasileiras em busca de emprego. A interface é em português do Brasil, mas o app também analisa vagas e currículos em inglês, mantendo o idioma do currículo original na saída.

## 🚫 A regra inviolável

O que separa este app de um "gerador de currículo" comum é a fidelidade ao que a pessoa realmente fez.

| ✅ A IA pode                                                                                                                   | ❌ A IA não pode                                                            |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Reordenar seções e bullets pelo que é mais relevante para a vaga                                                               | Adicionar skill, ferramenta ou palavra-chave sem evidência no currículo     |
| Reescrever frases com verbos de ação, mantendo o mesmo fato                                                                    | Inventar métricas, percentuais, valores, tamanho de equipe ou prazos        |
| Usar o vocabulário da vaga quando o currículo comprova o mesmo fato (ex.: "Amazon Web Services" → "AWS (Amazon Web Services)") | Alterar datas, empresas, cargos, títulos de formação ou nível de idioma     |
| Remover ruído, repetição e elementos que atrapalham a leitura do ATS                                                           | Aumentar o escopo de uma responsabilidade ("participei" não vira "liderei") |
| Escrever o resumo profissional usando **somente** fatos do currículo                                                           | Criar formação, certificações, idiomas ou ferramentas inexistentes          |

### Como a regra é garantida (no código, não só em uma frase)

1. **Prompts com a regra explícita**, saída em JSON estruturado (schema fixo) e temperatura baixa.
2. **Evidência obrigatória:** cada bullet e cada skill gerados trazem o trecho literal do currículo original que os sustenta. Sem evidência, o item é descartado.
3. **Auditoria de fidelidade:** uma segunda verificação independente, no papel de auditor, compara o currículo gerado com o original. Itens sem sustentação são removidos antes de aparecer na tela, com um aviso.
4. **Palavras-chave faltantes nunca entram sozinhas.** Só entram pelo fluxo "Tenho essa experiência", em que a pessoa descreve com as próprias palavras onde e como usou, e o item fica marcado como declarado. Um filtro final barra qualquer intruso.
5. **Transparência total:** o painel "O que mudou e por quê" lista cada alteração (antes → depois) com o motivo.

## ✨ Funcionalidades

|     | Recurso                 | Em uma frase                                                         |
| :-: | ----------------------- | -------------------------------------------------------------------- |
| 🧑‍💻  | Modo convidado          | Analise sem criar conta; nada é salvo                                |
| 📊  | Score transparente      | Nota de 0 a 100 calculada por regras visíveis, não "chutada" pela IA |
| 🔑  | Palavras-chave          | Encontradas com evidência; faltantes por importância                 |
| 📝  | Currículo otimizado     | Pré-visualização editável, fiel ao arquivo exportado                 |
| 🔍  | Auditoria de fidelidade | Remove automaticamente o que não tem sustentação                     |
| 📄  | Exportação              | PDF com texto real, DOCX editável, TXT                               |
| 🔐  | Conta segura            | E-mail, senha forte e exclusão de dados (LGPD)                       |
| 📚  | Histórico completo      | Recupere qualquer análise, com busca, filtros e versões              |
| 📈  | Painel de evolução      | Médias, melhor resultado e evolução recente                          |

### 🧑‍💻 Análise sem conta (modo convidado)

- Cole a vaga e o currículo e analise sem criar conta. **Nenhum resultado é salvo no histórico:** ele existe apenas durante o uso da página.
- Os dois campos aceitam até 15.000 caracteres, com contador de caracteres".
- Título da vaga e empresa são opcionais e ajudam a organizar as análises salvas depois (conta conectada).
- Mensagens de andamento informam as etapas de leitura, comparação, geração e verificação.

### 📊 Score de compatibilidade transparente

- Score de 0 a 100 com comparativo **Antes → Depois** da otimização.
- Fórmula visível na tela ("Como calculamos"): cada requisito **Essencial** vale 3 pontos e cada **Desejável** vale 1. Score = pontos conquistados ÷ pontos possíveis × 100.
- Resultado calculado pelo sistema. A IA identifica os requisitos e ajuda em correspondências semânticas, mas não escolhe a pontuação.
- Checklist de formato ATS **separado** da pontuação de conteúdo, cobrindo contato, seções, datas e extensão.

### 🔑 Painel de palavras-chave

- **Encontradas:** cada palavra mostra o trecho do currículo que comprova a correspondência.
- **Faltantes:** organizadas por importância, com o fluxo honesto **"Não tenho isso" / "Tenho essa experiência"**, que impede a inclusão automática de algo que a pessoa não possui.
- Cada palavra traz sua categoria: habilidade, ferramenta, comportamento, certificação, idioma ou senioridade.
- Ao declarar uma experiência real, o score é recalculado.

### 📝 Currículo otimizado

- Pré-visualização em folha A4 branca, inclusive no tema escuro do app.
- Edição campo a campo antes de copiar ou exportar.
- Estrutura simples, de uma coluna, legível por sistemas ATS.
- Painel **"O que mudou e por quê"**, com cada alteração relevante e sua justificativa.
- Auditoria automática de fidelidade, com remoção e aviso sobre afirmações sem sustentação.
- Três **modos de saída**, que adaptam estrutura, ordem das seções e vocabulário sem abandonar a regra de nunca inventar:
  - **Geral:** estrutura profissional aplicável a diferentes áreas.
  - **Tecnologia:** habilidades técnicas organizadas por categoria, com destaque para projetos e GitHub quando existirem.
  - **Primeiro emprego:** prioridade para formação, cursos e projetos, sem criar seção de experiência profissional quando ela não existe.

### 📄 Exportação

- **PDF** A4 com texto real e selecionável (nunca uma imagem, porque o ATS não lê imagem).
- **DOCX** editável no Word.
- **TXT** e **cópia como texto puro**.
- Nome de arquivo no padrão `Nome_Sobrenome_Titulo-da-vaga`.
- **Reexportação** de uma análise já salva, sem processá-la novamente.

### 🔐 Conta e privacidade

- Cadastro e entrada por **e-mail e senha**, com confirmação de e-mail e recuperação de senha.
- **Política de senha forte**, com medidor de força e lista de requisitos em tempo real, validada na tela e no servidor.
- Suporte a gerenciadores de senha e opção de mostrar ou ocultar a senha.
- Exclusão da conta e de todos os dados associados (LGPD).

### 📚 Histórico completo

Quando a pessoa está conectada, cada análise salva conserva o resultado por inteiro:

- descrição original da vaga e currículo original;
- título da vaga, empresa e modo escolhido;
- score antes e depois;
- palavras-chave encontradas e faltantes, e as experiências declaradas pela pessoa;
- currículo otimizado, mudanças realizadas e alertas de fidelidade;
- grupo e número da versão, e data de criação.

Na página **Meu histórico** é possível:

- 🔎 pesquisar por vaga ou empresa e filtrar por modo;
- 🗂 ver as versões da mesma análise agrupadas;
- 📂 abrir e recuperar o resultado completo, e editar a cópia recuperada antes de exportar;
- 📤 reexportar em PDF, DOCX ou TXT, ou copiar o currículo como texto;
- ➕ duplicar a análise como uma nova versão;
- 🗑 excluir uma versão, somente após confirmação.

### 📈 Painel de evolução

- Média dos scores antes da otimização e média dos scores depois.
- Melhor resultado alcançado.
- Evolução recente das análises salvas, com score, modo e data.
- Estado vazio que orienta a pessoa a salvar a primeira análise.

### 🎨 Interface e acessibilidade

- Temas **claro e escuro**, com preferência salva no navegador e respeito à configuração do dispositivo.
- Uso confortável em **celular, tablet e computador**, sem rolagem horizontal. Em telas menores, o resultado se organiza em abas e uma barra de ações.
- Contraste adequado, foco visível e navegação por teclado.
- Nada depende só do mouse: o que aparece ao passar o cursor também funciona ao tocar ou pelo teclado.
- Mensagens de erro em português, com orientação clara para tentar novamente.

## 🧭 Como o projeto começou

### 🤖 O prompt foi gerado com o Claude, da Anthropic

O briefing que originou este app não foi escrito de improviso: ele foi elaborado em conversa com o **Claude**, o assistente de IA da **Anthropic**. A ideia e as decisões de produto vieram do autor (o núcleo do app e a regra de nunca inventar experiência); o Claude ajudou a transformar isso em uma especificação técnica completa e pronta para o Lovable, com pontos de arquitetura que fazem diferença no resultado: o score calculado em código e não pela IA, a verificação de fidelidade em uma segunda chamada, o PDF com texto real, a política de senha forte e o design system com paleta e tipografia. Veja [ o prompt criado pelo Claude](./docs/mega-prompt-claude-lovable.md).

Depois o prompt foi refinado em rodadas, e o Claude também preparou o conjunto de casos de teste que valida a regra principal (veja [Testes de validação](./docs/casos-de-teste-regra-nao-inventar.md)). O resultado é um exemplo prático de desenvolvimento em duas etapas com IA: **Claude para especificar**, **Lovable para construir**.

### 📝 O que o briefing definiu

| Área                  | O que foi definido                                                                                                                                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Produto**           | App web em que a pessoa cola vaga e currículo e recebe match, palavras-chave encontradas e faltantes, explicação do cálculo e um currículo otimizado para revisar, editar e exportar. Interface em pt-BR, com suporte a vagas e currículos em inglês                         |
| **Regra inviolável**  | Nunca inventar experiência: o que a IA pode e não pode fazer, mais as cinco garantias em código descritas [acima](#-a-regra-inviolável)                                                                                                                                      |
| **Fluxo principal**   | Análise sem cadastro, dois campos de texto (limite de 15.000 caracteres), título e empresa opcionais, três modos de saída, progresso real e resultado com score antes/depois, palavras-chave com evidências, pré-visualização editável, "O que mudou e por quê" e exportação |
| **Score**             | Extração de requisitos por IA, comparação em código (IA só para casos ambíguos, sempre com evidência), pesos 3 e 1, fórmula exibida na tela e checklist de formato separado                                                                                                  |
| **Exportação**        | PDF com texto real, DOCX, TXT; proibido gerar PDF a partir de imagem ou canvas; regras ATS-friendly (uma coluna, títulos padrão, datas MM/AAAA)                                                                                                                              |
| **Conta e histórico** | Login com confirmação de e-mail e senha forte, recuperação de senha, histórico com versionamento e isolamento por usuário, acompanhamento da evolução e exclusão de conta (LGPD)                                                                                             |
| **Design**            | Identidade limpa e acolhedora, com **índigo** como cor primária, tipografia **Plus Jakarta Sans** (títulos) e **Inter** (interface), temas claro e escuro definidos como design tokens, mobile-first e pensado para 375px, 768px e 1280px                                    |
| **Acessibilidade**    | Contraste WCAG AA, foco visível, navegação por teclado, ARIA nos componentes dinâmicos, animações que respeitam `prefers-reduced-motion`                                                                                                                                     |
| **Segurança**         | Nenhuma chave de API no front-end, IA apenas em Edge Functions, validação no servidor, RLS em todas as tabelas, sem conteúdo de currículos em logs e limite de uso contra abuso                                                                                              |

### 🔁 Evolução do prompt

1. **Versão 1:** núcleo do produto, regra de nunca inventar, exportação, recursos adicionais e modos de saída.
2. **Versão 2:** acrescentou o **design system** (paleta, fontes, componentes), a **responsividade** para desktop, tablet e celular e a **política de senha forte** no login.
3. **Testes:** criação de casos de teste com dados fictícios, cada um com uma "armadilha" contra a regra principal.

### 📋 Ordem de implementação pedida

O prompt orientou o Lovable a construir em etapas, garantindo que cada uma funcionasse antes de avançar:

1. **Design system** e núcleo em modo convidado (entrada, análise, score, palavras-chave, currículo otimizado, verificação de fidelidade, painel de mudanças, copiar como texto)
2. **Exportação** em PDF (texto real) e DOCX
3. **Login** com senha forte e confirmação de e-mail, banco de dados e histórico
4. **Painel de evolução**
5. **Modos** Tecnologia e Primeiro emprego

### ✅ Critério de aceite do núcleo

Com uma vaga e um currículo reais, o app devolve um score coerente, lista as palavras-chave encontradas e faltantes com evidências, gera um currículo em que **todo item tem evidência no original** e **nunca adiciona uma skill ausente** sem a confirmação explícita da pessoa. A interface deve estar agradável e utilizável em 375px, 768px e 1280px, nos temas claro e escuro.

### 🛠 Solicitações feitas após a geração do aplicativo

Depois da primeira versão, foram solicitados e realizados os seguintes ajustes:

1. **Remoção do login com Google:** a tela de acesso passou a oferecer somente cadastro e entrada com e-mail e senha.
2. **Criação do README para o GitHub:** apresentação completa do projeto, em linguagem institucional e não técnica.
3. **Verificação de chaves, tokens e senhas:** revisão preventiva dos arquivos antes do envio ao GitHub. Nenhum segredo privado foi encontrado; arquivos locais de configuração foram protegidos contra envio acidental e foi criado um modelo com valores fictícios.
4. **Revisão da proteção do limite de uso:** reforço da identificação do visitante, para que o limite de análises não seja burlado por informações falsificadas.
5. **Atualizações de segurança:** correção das vulnerabilidades conhecidas encontradas nas bibliotecas utilizadas e nova verificação, sem pendências.
6. **Recuperação completa do histórico:** a lista, que inicialmente mostrava só informações resumidas, passou a abrir cada análise salva com todo o resultado original.
7. **Busca, filtros e versões no histórico:** pesquisa por vaga ou empresa, filtro por modo e agrupamento das versões da mesma análise.
8. **Novas ações no histórico:** reexportação, cópia, duplicação como nova versão e exclusão com confirmação.
9. **Título da vaga e empresa:** campos opcionais no formulário, para identificar melhor as análises salvas.
10. **Nova publicação:** as melhorias foram publicadas no mesmo endereço público, sem alterar o link já compartilhado.
11. **Atualização do README:** incorporação das solicitações mais recentes e revisão das funcionalidades para refletir o que está disponível.
12. **Revisão do README com o Claude:** melhoria da apresentação e inclusão das decisões de arquitetura, da stack, dos testes e das limitações.

## 🧰 Stack tecnológica

| Camada                     | Tecnologia                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------- |
| **Front-end**              | React, Vite, TypeScript, Tailwind CSS, shadcn/ui, lucide-react (ícones)               |
| **Exportação**             | PDF vetorial com texto real e biblioteca `docx` para Word, ambos gerados no navegador |
| **Backend**                | Lovable Cloud (Supabase): Postgres com RLS, Auth e Edge Functions                     |
| **IA**                     | Lovable AI Gateway, chamado **somente** dentro das Edge Functions                     |
| **Tipografia**             | Plus Jakarta Sans e Inter                                                             |
| **Especificação (prompt)** | Claude, da Anthropic                                                                  |
| **Construção do app**      | Lovable                                                                               |

## 🔒 Segurança e privacidade

Currículos contêm dados pessoais e profissionais. Por isso, a segurança faz parte do núcleo do produto:

- 🔑 **Nenhuma chave privada fica no navegador.** A análise e a geração acontecem em ambiente protegido, no servidor.
- 📁 **Nenhum segredo privado foi incluído no repositório.** Arquivos locais de configuração ficam fora do envio ao GitHub, e o arquivo de exemplo contém apenas valores fictícios.
- 🧮 **O score é calculado por regras transparentes.** A IA ajuda a interpretar a vaga, mas não escolhe livremente a pontuação.
- 🧾 **Toda afirmação precisa de evidência.** Os itens do currículo otimizado devem estar ligados ao conteúdo original ou a uma declaração explícita da pessoa.
- 🔍 **Uma segunda verificação revisa a fidelidade.** Conteúdo sem sustentação é removido antes de aparecer no resultado.
- ✋ **Palavras ausentes não entram automaticamente.** A pessoa precisa confirmar e explicar a experiência real.
- 👤 **Cada conta acessa somente os próprios dados.** As análises são isoladas por usuário.
- 🕵️ **O modo convidado não grava a análise no histórico.** O resultado permanece apenas durante o uso da página.
- ⏱ **Limite de 12 análises por hora**, como proteção contra abuso. A identificação usada para aplicar esse limite foi protegida contra falsificação pelo visitante.
- ✅ **As entradas são validadas antes do processamento.** Textos fora dos limites ou em formato inesperado são recusados com uma explicação em português.
- 🚫 **O conteúdo dos currículos não é registrado nos logs técnicos.** Os dados são usados somente para produzir a análise solicitada.
- 🩹 **As bibliotecas passaram por atualização de segurança.** As vulnerabilidades conhecidas identificadas na revisão foram corrigidas e a verificação posterior ficou sem pendências.
- 🗑 **A exclusão é completa.** A pessoa pode remover sua conta e os dados associados.

## 🧪 Testes de validação

A regra de nunca inventar foi validada com **7 casos de teste com dados fictícios**, cada um com uma armadilha específica e uma lista de termos proibidos. Um único termo proibido que apareça sem ter passado pelo fluxo "Tenho essa experiência" é considerado um bug da regra principal.

| Caso | Armadilha                                                             |
| :--: | --------------------------------------------------------------------- |
|  1   | Controle: currículo compatível, nada deve ser acrescentado            |
|  2   | Vaga pede várias tecnologias que o currículo não tem                  |
|  3   | Verbos de apoio ("auxilio", "participo") tentando virar liderança     |
|  4   | Vaga exige percentuais e o currículo não tem nenhum número            |
|  5   | Primeiro emprego: sem experiência profissional, sem estágio inventado |
|  6   | Instrução escondida no currículo e vaga em inglês                     |
|  7   | Transição de carreira: habilidades adjacentes e curso em andamento    |

📎 **Documento completo com vagas, currículos, resultados esperados e planilha de verificação:** [`docs/casos-de-teste-regra-nao-inventar.md`](docs/casos-de-teste-regra-nao-inventar.md)

## 🚧 Aviso honesto e limitações

> [!WARNING]
> O ATS Match 4All ajuda você a apresentar melhor a experiência e as qualificações que já tem. Ele **não promete emprego**, entrevista ou aprovação em processos seletivos: o score é uma referência de aderência entre o currículo e a vaga, e você é responsável por incluir apenas o que pode comprovar em uma entrevista.

**Limitações conhecidas:**

- A entrada é feita por **texto colado**; ainda não há upload de arquivos PDF ou DOCX.
- O score mede a **aderência de palavras-chave** entre currículo e vaga. Ele não avalia a qualidade do candidato, e cada ATS do mercado funciona de um jeito.
- A IA pode errar. **Revise sempre** o currículo gerado antes de enviar, principalmente datas, cargos e nomes de empresas.
- O painel de evolução apresenta médias, melhor resultado e evolução recente. O gráfico de linha e o comparador lado a lado de versões, previstos no briefing original, não fazem parte da versão atual.
- Há um limite de 12 análises por hora, como proteção contra abuso.

## 👤 Autoria e agradecimentos

- **Autor e idealização:** Roberto ([@a-r-soares](https://github.com/a-r-soares))
- **Prompt inicial e casos de teste:** gerados com o **Claude**, da [Anthropic](https://www.anthropic.com)
- **Construção do aplicativo:** [Lovable](https://lovable.dev)

---

<div align="center">

_Desenvolvido com Lovable: React, TypeScript, Tailwind CSS e Lovable Cloud (dados, autenticação e processamento protegido)._

⭐ Se o projeto foi útil, deixe uma estrela no repositório.

</div>
