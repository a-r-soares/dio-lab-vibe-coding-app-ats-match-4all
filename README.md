# ATS Match 4All

**Cole a vaga, cole o currículo, receba o match — e um currículo otimizado que nunca inventa experiência.**

O ATS Match 4All é uma aplicação web que ajuda pessoas em busca de emprego a entender como o próprio currículo se compara aos requisitos de uma vaga. Antes de chegar a um recrutador, muitos currículos passam por um sistema de triagem chamado ATS (*Applicant Tracking System*). A ferramenta apresenta o percentual de compatibilidade, mostra palavras-chave encontradas e ausentes e prepara uma versão do currículo mais adequada para essa triagem.

> **Regra inviolável do projeto:** a aplicação melhora a forma como a pessoa apresenta a experiência que realmente possui. Ela nunca cria, aumenta ou insinua experiência, cargo, empresa, formação, certificação, ferramenta, resultado numérico, senioridade ou período que não esteja no currículo original ou que não tenha sido declarado explicitamente pela própria pessoa.

**Aplicação publicada:** https://match4all-lovable-jobs.lovable.app

---

## Como o projeto começou — o prompt original

O ATS Match 4All nasceu de um briefing detalhado. Abaixo está uma apresentação fiel e organizada do pedido original que orientou o desenvolvimento.

### Visão geral

Criar uma aplicação web em português do Brasil na qual a pessoa possa colar a descrição de uma vaga e o texto do currículo para receber:

- percentual de compatibilidade entre currículo e vaga;
- palavras-chave encontradas e faltantes;
- explicação transparente do cálculo;
- currículo otimizado para sistemas ATS;
- possibilidade de revisar, editar e exportar o resultado.

A aplicação também deveria aceitar vagas e currículos em inglês, mantendo no resultado o idioma do currículo original.

### Regra inviolável: nunca inventar experiência

A otimização poderia:

- reorganizar seções;
- reescrever frases com verbos de ação;
- reduzir repetições e remover informações pouco relevantes;
- usar o vocabulário da vaga quando o currículo comprovasse o mesmo conhecimento;
- tornar mais claras experiências e qualificações já existentes.

A otimização não poderia:

- adicionar competências sem evidência;
- inventar resultados ou métricas;
- alterar datas, empresas ou cargos;
- aumentar a senioridade ou o nível de conhecimento;
- transformar participação em liderança;
- criar formação, certificações, idiomas ou ferramentas inexistentes.

Cada item gerado deveria ter como base um trecho literal do currículo original. Uma segunda verificação independente deveria revisar a fidelidade do conteúdo antes da apresentação do resultado e remover qualquer afirmação sem sustentação.

### Fluxo principal

- Permitir a análise sem exigir cadastro.
- Exibir duas áreas de texto grandes: uma para a vaga e outra para o currículo, com limite de 15.000 caracteres e contador.
- Oferecer campos opcionais para título da vaga e empresa.
- Disponibilizar os modos **Geral**, **Tecnologia** e **Primeiro emprego**.
- Mostrar mensagens de andamento durante a leitura, comparação, geração e verificação.
- Apresentar score antes e depois, palavras-chave, currículo otimizado, explicação das mudanças e opções de exportação.

### Cálculo do match

O percentual não deveria ser um número escolhido pela inteligência artificial. O pedido definiu um cálculo determinístico e visível:

- requisito **Essencial**: peso 3;
- requisito **Desejável**: peso 1;
- score = pontos conquistados ÷ pontos possíveis × 100.

A inteligência artificial poderia identificar requisitos e ajudar em correspondências semânticas, mas a pontuação final deveria ser calculada pelo sistema. A verificação de formato ATS deveria aparecer separadamente e não alterar o score de conteúdo.

### Palavras-chave e declaração de experiência

As palavras encontradas deveriam mostrar a evidência correspondente no currículo. Para cada palavra ausente, a pessoa deveria poder escolher:

- **Não tenho isso**; ou
- **Tenho essa experiência**.

No segundo caso, a pessoa precisaria descrever, com as próprias palavras, onde e como adquiriu aquela experiência. Somente então a informação poderia entrar no currículo, identificada como declaração da própria pessoa.

### Currículo otimizado

O resultado deveria ter:

- visualização em página A4 clara, inclusive quando o aplicativo estivesse no tema escuro;
- edição dos campos antes da exportação;
- estrutura de uma coluna, adequada à leitura por ATS;
- seções e datas em formatos reconhecíveis;
- painel **“O que mudou e por quê”**;
- alertas sobre informações removidas pela verificação de fidelidade.

### Exportação

O briefing solicitou:

- PDF A4 com texto real e selecionável, nunca uma imagem do currículo;
- DOCX editável no Word;
- TXT;
- cópia como texto puro;
- nome de arquivo no padrão `Nome_Sobrenome_Titulo-da-vaga`.

### Conta, histórico e evolução

O pedido também incluiu:

- conta com confirmação de e-mail e senha forte;
- recuperação de senha;
- salvamento das análises com isolamento por usuário;
- histórico com título, empresa, data, score e modo;
- busca, filtro, abertura, duplicação, reexportação e exclusão com confirmação;
- agrupamento de novas análises da mesma vaga em versões;
- acompanhamento da evolução dos resultados;
- exclusão da conta e dos dados, em respeito à LGPD.

### Modos de saída

- **Geral:** estrutura profissional aplicável a diferentes áreas.
- **Tecnologia:** habilidades técnicas organizadas por categoria, com destaque para projetos e GitHub quando essas informações existirem.
- **Primeiro emprego:** prioridade para formação, cursos e projetos, sem criar uma seção de experiência profissional quando ela não existir.

### Interface, acessibilidade e privacidade

O aplicativo deveria ser claro, profissional e acolhedor, funcionar bem em celular, tablet e computador e oferecer temas claro e escuro. Também deveria incluir navegação por teclado, foco visível, bom contraste e interações que não dependessem apenas do mouse.

Por tratar dados pessoais presentes em currículos, o briefing exigiu processamento protegido, validação das entradas, nenhuma chave privada no navegador, isolamento dos dados por usuário, limite de uso contra abuso e ausência do conteúdo dos currículos nos registros técnicos.

---

## Solicitações feitas após a geração do aplicativo

Depois da primeira versão, foram solicitados e realizados os seguintes ajustes:

1. **Remoção do login com Google** — a tela de acesso passou a oferecer somente cadastro e entrada com e-mail e senha.
2. **Criação do README para o GitHub** — preparação de uma apresentação completa do projeto, em linguagem institucional e não técnica.
3. **Verificação de chaves, tokens e senhas** — revisão preventiva dos arquivos antes do envio ao GitHub. Nenhum segredo privado foi encontrado no projeto; arquivos locais de configuração foram protegidos contra envio acidental e foi criado um modelo com valores fictícios.
4. **Revisão da proteção do limite de uso** — reforço da identificação do visitante para impedir que o limite de análises seja burlado por informações falsificadas.
5. **Atualizações de segurança** — correção das vulnerabilidades conhecidas encontradas nas bibliotecas utilizadas e nova verificação sem pendências.
6. **Recuperação completa do histórico** — a lista, que inicialmente mostrava apenas informações resumidas, passou a permitir a abertura de cada análise salva com todo o resultado original.
7. **Busca, filtros e versões no histórico** — inclusão de pesquisa por vaga ou empresa, filtro por modo e agrupamento das versões da mesma análise.
8. **Novas ações no histórico** — inclusão de reexportação, cópia, duplicação como nova versão e exclusão com confirmação.
9. **Título da vaga e empresa** — inclusão desses campos opcionais no formulário para facilitar a identificação das análises salvas.
10. **Nova publicação** — disponibilização das melhorias no mesmo endereço público, sem alterar o link já compartilhado.
11. **Atualização deste README** — incorporação das solicitações mais recentes e revisão das funcionalidades para refletir exatamente o que está disponível.

---

## Funcionalidades desenvolvidas

### Análise sem conta

- A pessoa pode colar a vaga e o currículo e realizar a análise sem criar uma conta.
- No modo convidado, nenhum resultado é salvo no histórico.
- Os dois campos aceitam até 15.000 caracteres, têm contador e opção para limpar o conteúdo.
- Título da vaga e empresa podem ser informados para facilitar a organização posterior.
- Mensagens de andamento informam as etapas de leitura, comparação, geração e verificação.

### Score de compatibilidade transparente

- Score de 0 a 100, com comparação **Antes → Depois** da otimização.
- Fórmula visível: requisitos essenciais valem 3 pontos e requisitos desejáveis valem 1 ponto.
- Resultado calculado pelo sistema, em vez de ser estimado livremente pela inteligência artificial.
- Checklist de formato ATS separado da pontuação de conteúdo, cobrindo contato, seções, datas e extensão.

### Painel de palavras-chave

- Palavras encontradas acompanhadas do trecho do currículo que comprova a correspondência.
- Palavras faltantes organizadas por importância.
- Identificação por categoria, como habilidade, ferramenta, comportamento, certificação, idioma ou senioridade.
- Fluxo **“Não tenho isso” / “Tenho essa experiência”**, impedindo a inclusão automática de informações que a pessoa não possui.
- Recálculo após uma experiência real ser declarada.

### Currículo otimizado

- Visualização em folha A4 branca, inclusive no tema escuro.
- Edição dos campos antes de copiar ou exportar.
- Estrutura simples e legível por sistemas ATS.
- Painel **“O que mudou e por quê”**, mostrando alterações relevantes e suas justificativas.
- Auditoria automática de fidelidade, com remoção e aviso sobre afirmações sem sustentação.
- Modos Geral, Tecnologia e Primeiro emprego, adaptando estrutura e vocabulário sem abandonar a regra de nunca inventar.

### Exportação

- PDF A4 com texto real e selecionável.
- DOCX editável.
- TXT.
- Cópia como texto puro.
- Nome de arquivo baseado no nome da pessoa e no título da vaga.
- Possibilidade de reexportar uma análise já salva sem processá-la novamente.

### Conta e privacidade

- Cadastro e entrada por e-mail e senha.
- Confirmação de e-mail e recuperação de senha.
- Política de senha forte, com medidor e lista de requisitos em tempo real.
- Suporte a gerenciadores de senha e opção de mostrar ou ocultar a senha.
- Exclusão da conta e de todos os dados associados.

### Histórico completo

Quando a pessoa está conectada, cada análise salva pode conservar:

- descrição original da vaga;
- currículo original;
- título da vaga e empresa;
- modo escolhido;
- score antes e depois;
- palavras-chave encontradas e faltantes;
- experiências declaradas pela pessoa;
- currículo otimizado;
- mudanças realizadas e alertas de fidelidade;
- grupo e número da versão;
- data de criação.

Na página **Meu histórico**, é possível:

- pesquisar por vaga ou empresa;
- filtrar por modo;
- visualizar versões agrupadas;
- abrir e recuperar o resultado completo;
- editar a cópia recuperada antes de exportar;
- exportar novamente em PDF, DOCX ou TXT;
- copiar o currículo como texto;
- duplicar a análise para criar uma nova versão;
- excluir uma versão somente após confirmação.

### Painel de evolução

- Média dos scores antes da otimização.
- Média dos scores depois da otimização.
- Melhor resultado alcançado.
- Evolução recente das análises salvas, com score, modo e data.
- Estado vazio orientando a pessoa a salvar a primeira análise.

### Interface e acessibilidade

- Temas claro e escuro, com preferência salva no navegador e respeito à configuração do dispositivo.
- Uso confortável em celular, tablet e computador.
- Conteúdo organizado para evitar rolagem horizontal.
- Abas e barra de ações adaptadas para telas menores.
- Contraste adequado, foco visível e navegação por teclado.
- Informações disponíveis por toque e teclado, sem depender apenas do movimento do mouse.
- Mensagens de erro em português, com orientação clara para tentar novamente.

---

## Segurança e privacidade

Currículos contêm dados pessoais e profissionais. Por isso, a segurança faz parte das funcionalidades centrais do ATS Match 4All:

- **Nenhuma chave privada fica no navegador.** A análise e a geração são realizadas em ambiente protegido.
- **Nenhum segredo privado foi incluído no repositório.** Arquivos locais de configuração ficam fora do envio ao GitHub, e o arquivo de exemplo contém apenas valores fictícios.
- **O score é calculado por regras transparentes.** A inteligência artificial ajuda a interpretar a vaga, mas não escolhe livremente a pontuação.
- **Toda afirmação precisa de evidência.** Os itens do currículo otimizado devem estar ligados ao conteúdo original ou a uma declaração explícita da pessoa.
- **Uma segunda verificação revisa a fidelidade.** Conteúdo sem sustentação é removido antes de aparecer no resultado.
- **Palavras ausentes não entram automaticamente.** A pessoa precisa confirmar e explicar a experiência real.
- **Cada conta acessa somente os próprios dados.** As análises são isoladas por usuário.
- **O modo convidado não grava a análise no histórico.** O resultado permanece apenas durante o uso da página.
- **Há limite de 12 análises por hora.** A identificação usada para aplicar esse limite foi protegida contra falsificação pelo visitante.
- **As entradas são validadas antes do processamento.** Textos fora dos limites ou em formato inesperado são recusados com uma explicação em português.
- **O conteúdo dos currículos não é registrado nos registros técnicos.** Os dados são usados somente para produzir a análise solicitada.
- **As bibliotecas passaram por atualização de segurança.** As vulnerabilidades conhecidas identificadas durante a revisão foram corrigidas e a verificação posterior ficou sem pendências.
- **A exclusão é completa.** A pessoa pode remover sua conta e os dados associados.

---

## Aviso honesto

O ATS Match 4All ajuda a apresentar melhor experiências e qualificações verdadeiras. A ferramenta não promete emprego, entrevista ou aprovação em processos seletivos. O score é uma referência de aderência entre o currículo e a vaga, e cada pessoa continua responsável por incluir somente informações que possa comprovar.

---

*Desenvolvido com Lovable — React, TypeScript, Tailwind CSS e Lovable Cloud para dados, autenticação e processamento protegido.*