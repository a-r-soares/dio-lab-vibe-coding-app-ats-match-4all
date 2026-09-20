# PROMPT: ATS Match 4All — análise de compatibilidade entre currículo e vaga

## 1. Visão geral

Crie uma aplicação web chamada "ATS Match" (nome provisório). A pessoa cola a descrição de uma vaga e o próprio currículo. A aplicação mostra o percentual de match, as palavras-chave encontradas e as que faltam, e gera uma versão do currículo otimizada para ATS (Application Tracking System, o software que ranqueia candidatos antes de qualquer pessoa do RH ler o currículo), pronta para exportar.

Público: pessoas brasileiras em busca de emprego. Interface em português do Brasil (pt-BR). A análise deve funcionar também para vagas e currículos em inglês, mantendo o idioma do currículo original na saída.

Dispositivos: a aplicação deve funcionar e ter ótima aparência em desktop, tablets e celulares, com o mesmo conjunto de funcionalidades em todos. Projete mobile-first e enriqueça o layout para telas maiores (detalhes na seção 8).

Stack: React + Vite + TypeScript + Tailwind + shadcn/ui + lucide-react (ícones). Backend com Lovable Cloud (Supabase): banco Postgres, Auth e Edge Functions. Chamadas de IA feitas exclusivamente em Edge Functions, nunca no front-end, usando o Lovable AI Gateway.

## 2. REGRA INVIOLÁVEL: nunca inventar experiência

Esta regra vale para a aplicação inteira e tem prioridade sobre qualquer outra instrução. A aplicação melhora COMO a pessoa se apresenta. Ela NUNCA cria, infla ou insinua experiência, cargo, empresa, formação, certificação, ferramenta, resultado numérico, senioridade ou período que não esteja no currículo original ou que a pessoa não tenha declarado explicitamente na interface.

O que a IA PODE fazer:

- Reordenar seções e bullets pelo que é mais relevante para a vaga.
- Reescrever frases com verbos de ação e clareza, mantendo o mesmo fato.
- Usar o vocabulário da vaga quando o currículo comprova a mesma coisa (exemplo: currículo diz "Amazon Web Services", vaga diz "AWS": pode escrever "AWS (Amazon Web Services)").
- Remover ruído, repetição e elementos que atrapalham a leitura do ATS.
- Escrever um resumo profissional usando SOMENTE fatos presentes no currículo.

O que a IA NÃO PODE fazer:

- Adicionar skill, ferramenta, tecnologia ou palavra-chave da vaga que não tenha evidência no currículo.
- Inventar métricas, percentuais, valores, tamanho de equipe ou prazos.
- Alterar datas, empresas, cargos, títulos de formação ou nível de idioma.
- Aumentar o escopo de uma responsabilidade (exemplo: "participei" virar "liderei").

Como isso será garantido no código:

1. Todo prompt de geração de currículo inclui essa regra de forma explícita e exige saída em JSON estruturado (schema fixo).
2. Cada bullet e cada item de skill na saída deve trazer o campo "source_evidence": o trecho literal do currículo original que o sustenta. Sem evidência, o item é descartado.
3. Após a geração, rode uma SEGUNDA chamada de IA, de verificação de fidelidade, com o papel de auditor: compara o currículo gerado com o original e sinaliza qualquer afirmação sem sustentação. Itens sinalizados são removidos automaticamente antes de mostrar o resultado. Use temperatura baixa nas duas chamadas.
4. Palavras-chave que faltam NUNCA entram sozinhas no currículo. Elas aparecem em um painel "O que falta" com uma explicação honesta: "A vaga pede X e não encontramos isso no seu currículo." Ao lado de cada uma há dois botões: "Não tenho isso" (padrão) e "Tenho essa experiência". Se a pessoa clicar no segundo, abre um campo de texto para ela descrever, com as próprias palavras, onde e como usou. Só então a aplicação incorpora o item, marcado internamente como "declarado pelo usuário". Mostre um aviso curto: "Inclua apenas o que você realmente pode comprovar em uma entrevista."
5. A tela de resultado tem o painel "O que mudou e por quê", listando cada alteração relevante (antes → depois) com o motivo. Nada muda sem ficar visível.

## 3. Fluxo principal (o núcleo, que deve funcionar perfeitamente antes de tudo)

Tela única, em etapas claras, sem exigir login para usar o núcleo:

**Entrada**

- Duas áreas de texto grandes: "Descrição da vaga" e "Seu currículo" (colar texto). Contador de caracteres, limite de 15.000 por campo, botão "Limpar".
- Opcional: campos "Título da vaga" e "Empresa" (para o histórico).
- Seletor de modo de saída: "Geral", "Tecnologia" ou "Primeiro emprego" (ver seção 7).
- Botão principal "Analisar e otimizar". Estado de carregamento com mensagens de progresso reais das etapas (lendo a vaga, comparando, gerando, verificando fidelidade).
- Aviso de privacidade discreto: sem login, nada é salvo.

**Resultado** (após o processamento)

1. Card de match, com o score de 0 a 100 em destaque, faixa de cor (baixo, médio, alto) e uma frase de contexto. Mostre o "antes" e o "depois" da otimização (score do currículo original e score da versão ajustada).
2. Painel de palavras-chave, em duas colunas (empilhadas em telas estreitas):
   - Encontradas: badges verdes, cada uma com o trecho do currículo que a comprova ao passar o mouse ou tocar.
   - Faltantes: badges âmbar, organizadas por importância (Essencial, Desejável), com o fluxo "Não tenho / Tenho essa experiência" descrito na regra 4.
   - Cada keyword tem categoria: Hard skill, Ferramenta/Tecnologia, Soft skill, Certificação/Formação, Idioma, Senioridade.
3. Currículo otimizado, com pré-visualização fiel ao que será exportado, editável campo a campo (a pessoa pode ajustar qualquer texto antes de exportar).
4. Painel "O que mudou e por quê" e alertas de fidelidade (itens removidos por falta de evidência, com explicação).
5. Botões de exportação (seção 4) e "Copiar como texto".

Ao clicar em "Tenho essa experiência" e confirmar, recalcule o score e atualize o currículo sem refazer toda a análise (chame só a etapa necessária).

## 4. Exportação

- PDF: A4, uma coluna, texto REAL e selecionável. É proibido gerar PDF a partir de imagem, screenshot ou canvas (html2canvas), porque o ATS não lê imagem. Use geração com texto vetorial (jsPDF com texto, @react-pdf/renderer ou equivalente).
- DOCX: gerado no navegador com a biblioteca "docx", com estilos reais de título e lista, para a pessoa editar no Word antes de enviar.
- TXT / copiar: texto puro limpo.
- Nome do arquivo: Nome_Sobrenome_Titulo-da-vaga.
- A exportação deve funcionar também em celulares e tablets (download direto ou menu de compartilhamento do sistema).

Regras de formato ATS-friendly que TODA exportação deve seguir:

- Uma coluna, sem tabelas, sem caixas de texto, sem imagens, sem ícones, sem gráficos de barras de skills, sem foto.
- Nada de informação importante em cabeçalho ou rodapé do documento.
- Fonte padrão (Arial, Calibri ou similar), tamanho 10 a 12, boa margem.
- Títulos de seção padrão e reconhecíveis: "Resumo Profissional", "Experiência Profissional", "Formação Acadêmica", "Habilidades", "Certificações", "Idiomas".
- Ordem cronológica reversa, datas em formato consistente (MM/AAAA).
- Bullets simples (marcador padrão), começando com verbo de ação.
- Dados de contato em texto simples no topo (nome, cidade/UF, e-mail, telefone, LinkedIn).

## 5. Cálculo do match (transparente e determinístico)

O score NÃO deve ser um número "chutado" pela IA. Faça assim:

1. Etapa de IA 1: extrair da vaga a lista de requisitos e palavras-chave, cada uma com categoria e importância (Essencial ou Desejável), incluindo sinônimos e variações (exemplo: "JS", "JavaScript"; "Gestão de projetos", "Project management").
2. Comparação em código: normalize os textos (minúsculas, sem acentos, sem pontuação) e procure cada keyword e seus sinônimos no currículo. Use a IA apenas para resolver casos semânticos ambíguos, sempre retornando o trecho de evidência.
3. Fórmula: Essencial pesa 3, Desejável pesa 1. Score = (soma dos pesos das encontradas ÷ soma dos pesos totais) × 100, arredondado.
4. Mostre em uma seção "Como calculamos" a fórmula e a lista de itens com peso, para que a pessoa entenda a nota.
5. Separe o score de conteúdo (keywords) de um checklist de formato ATS (contato completo, seções padrão, sem tabelas nem imagens, datas consistentes), exibido como lista de verificações com ✔ e ✖, sem misturar com o score de conteúdo.

## 6. Recursos adicionais (implementar após o núcleo estar estável)

**6.1 Login com senha forte e confirmação de e-mail**

- Cadastro e login com e-mail e senha usando Supabase Auth, com confirmação de e-mail obrigatória. Inclua também o fluxo "Esqueci minha senha" (redefinição por e-mail). E-mails em pt-BR, com layout simples e o nome do app.
- POLÍTICA DE SENHA FORTE (obrigatória, não permitir senhas simples):
  - Mínimo de 10 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um símbolo.
  - Rejeitar senhas comuns e previsíveis (exemplos: "123456", "senha123", "password", "qwerty", "brasil123", "admin"), sequências (abcdef, 123456789) e repetições (aaaaaaaa).
  - Rejeitar senhas que contenham o nome da pessoa ou a parte do e-mail antes do @.
  - Ativar, se disponível no Supabase Auth, a proteção contra senhas vazadas (leaked password protection) e configurar os requisitos mínimos de senha do próprio Auth.
  - A validação deve existir no front-end (feedback imediato) E no servidor. Nunca confie só no front-end.
  - Na tela de cadastro e na de redefinição de senha: medidor de força da senha em tempo real e checklist visual dos requisitos (com ícone e texto, não só cor), botão mostrar/ocultar senha, campo de confirmação de senha, e mensagens de erro claras em pt-BR que digam exatamente o que falta.
  - Permitir colar senha e usar gerenciadores de senhas (atributos autocomplete corretos: "new-password" no cadastro e "current-password" no login).
  - Limitar tentativas de login e de cadastro (proteção contra força bruta), com mensagem amigável.
- O núcleo continua disponível sem login (modo convidado, sem salvar nada). O login desbloqueia histórico e dashboard, e um convite para entrar aparece no resultado ("Crie uma conta para salvar esta análise").
- Tela para excluir a conta e todos os dados (LGPD).
- As telas de login, cadastro e redefinição seguem o mesmo design system e são totalmente responsivas.

**6.2 Histórico em banco de dados**

- Tabela "analyses": id, user_id, job_title, company, job_text, resume_original_text, mode, score_before, score_after, keywords_found (jsonb), keywords_missing (jsonb), user_declared_items (jsonb), resume_generated (jsonb), fidelity_flags (jsonb), version_group_id, version_number, created_at.
- version_group_id agrupa as versões do mesmo currículo para a mesma vaga: ao reanalisar, incrementa a versão em vez de criar uma análise solta.
- Row Level Security obrigatória: cada usuário só lê, cria, edita e apaga as próprias linhas.
- Página "Meu histórico": lista com título da vaga, empresa, data, score e modo. Busca e filtro. Abrir uma análise antiga restaura o resultado completo. Botões duplicar, reexportar e excluir (com confirmação). Em telas estreitas, a lista vira cards empilhados em vez de tabela.

**6.3 Dashboard de evolução**

- Gráfico de linha (Recharts) mostrando a evolução do score entre as versões de uma mesma vaga, com pontos clicáveis que abrem a versão.
- Cards de resumo: total de análises, score médio, melhor score, keyword faltante mais recorrente entre as vagas analisadas (dica de skill a estudar).
- Comparador de duas versões lado a lado (em celular, alternado por abas), com diferenças destacadas.
- Estados vazios amigáveis quando ainda não há dados.

## 7. Modos de saída especializados

O seletor de modo altera o prompt de geração, a ordem das seções e o vocabulário. A regra de nunca inventar vale integralmente em todos os modos.

- **Geral**: estrutura padrão da seção 4.
- **Tecnologia**: seção "Habilidades Técnicas" organizada por categorias (Linguagens, Frameworks, Cloud, Bancos de dados, Ferramentas, Metodologias) que contenham só o que o currículo comprova. Destaque para projetos, links de GitHub e portfólio, e certificações. Bullets com stack e contexto do problema, sem inventar métricas.
- **Primeiro emprego**: sem exigir experiência formal. Priorize Formação, Cursos, Projetos acadêmicos e pessoais, Voluntariado, Atividades extracurriculares e Habilidades. Se a pessoa não tem experiência profissional, a seção simplesmente não aparece, sem preencher com conteúdo fabricado. Resumo focado em objetivo e formação.

## 8. Design, estilo e responsividade

### 8.1 Identidade visual

Visual limpo, profissional, moderno e acolhedor, que transmita confiança e clareza (a pessoa está em um momento de ansiedade, então a interface deve acalmar e orientar, nunca poluir). Muito espaço em branco, hierarquia tipográfica clara, poucos elementos por bloco. Nada de aparência de "template genérico": use a paleta e as regras abaixo de forma consistente.

Defina tudo como design tokens (variáveis CSS do Tailwind/shadcn) logo no início, para que a paleta e as fontes sejam trocadas em um único lugar.

### 8.2 Paleta de cores

Tema claro:

- Primária (ações, links, foco): índigo #4F46E5; hover #4338CA; tom suave para fundos #EEF2FF.
- Fundo da página: #F8FAFC. Superfícies (cards, campos): #FFFFFF.
- Texto principal: #0F172A. Texto secundário: #475569. Texto de apoio/placeholder: #64748B.
- Bordas e divisores: #E2E8F0.
- Sucesso / palavra-chave encontrada / score alto: verde #059669; texto sobre fundo suave #047857; fundo suave #ECFDF5.
- Atenção / palavra-chave faltante / score médio: âmbar #D97706; texto sobre fundo suave #B45309; fundo suave #FFFBEB.
- Erro / score baixo: rosa-avermelhado #E11D48; fundo suave #FFF1F2.
- Informação: azul #0284C7; fundo suave #F0F9FF.

Tema escuro (respeitar a preferência do sistema e oferecer alternador manual, salvo no navegador):

- Primária: índigo claro #818CF8 (texto sobre a primária: #0F172A); fundo suave #1E1B4B.
- Fundo da página: #0B1120. Superfícies: #111827, com elevação em #1F2937.
- Texto principal: #F1F5F9. Secundário: #CBD5E1. Apoio: #94A3B8.
- Bordas: #1F2937 a #334155.
- Verde #34D399, âmbar #FBBF24, vermelho #FB7185, azul #38BDF8, todos com fundos suaves translúcidos (10 a 15% de opacidade).

Regras: contraste mínimo WCAG AA (4,5:1 para texto). Verde e âmbar nunca são o único indicador: sempre acompanham ícone e texto (✔ Encontrada, ⚠ Faltante). Usar a cor primária com parcimônia, reservada para ações e destaques.

### 8.3 Tipografia

- Títulos (h1 a h3) e o número do score: "Plus Jakarta Sans" (pesos 600 e 700).
- Corpo, campos e interface: "Inter" (pesos 400, 500 e 600), com números tabulares (font-variant-numeric: tabular-nums) em scores e contadores.
- Carregar via Google Fonts com font-display: swap e fallback para system-ui, sans-serif.
- Escala: base 16px (nunca menos que 16px em campos de texto, para o iOS não dar zoom ao focar); títulos de página 28 a 36px no desktop e 24 a 28px no celular; altura de linha 1.5 a 1.65 no corpo.
- Exceção importante: a PRÉ-VISUALIZAÇÃO do currículo usa Arial (ou Calibri, se disponível), tamanho equivalente a 10,5 pt, fundo branco e texto preto, para ser fiel ao arquivo exportado e ao que o ATS lê. Ela nunca herda o estilo do app nem o tema escuro (mesmo no tema escuro, a "folha" permanece branca, apresentada como um papel sobre o fundo).

### 8.4 Forma, espaçamento e movimento

- Cantos arredondados: 12px em cards, 8px em campos e botões, 9999px em badges. Sombras suaves e discretas (no tema escuro, prefira bordas a sombras).
- Escala de espaçamento em múltiplos de 4px; respiro generoso dentro dos cards (20 a 24px no desktop, 16px no celular).
- Ícones: lucide-react, traço fino e consistente.
- Animações curtas e sutis (150 a 250 ms): contagem progressiva do score, entrada suave dos resultados, skeletons durante o carregamento. Respeitar prefers-reduced-motion, desativando animações quando o usuário pedir.

### 8.5 Componentes principais

- Card de match: medidor circular (gauge em SVG) com o score no centro em fonte grande, cor conforme a faixa (0 a 49 vermelho, 50 a 74 âmbar, 75 a 100 verde), e ao lado o comparativo "Antes → Depois" com uma seta e a variação em pontos.
- Botão principal ("Analisar e otimizar"): índigo, largo, com altura mínima de 48px; desabilitado com explicação quando faltar texto; com spinner e mensagens de progresso durante o processamento.
- Áreas de texto: bordas suaves, anel de foco índigo bem visível, contador discreto no canto, altura confortável (mínimo de 10 linhas no desktop).
- Badges de keywords: pílulas com ícone, cor semântica (verde/âmbar) e categoria em texto menor; ao tocar ou passar o mouse, mostram a evidência em um popover.
- Alternador de modo (Geral / Tecnologia / Primeiro emprego): controle segmentado, com descrição curta de cada modo.
- Pré-visualização do currículo: "folha" A4 branca com sombra leve sobre um fundo neutro.
- Estados vazios, de erro e de carregamento sempre desenhados, com texto humano e uma ação clara (ilustrações simples em SVG, sem imagens pesadas).
- Cabeçalho simples: logotipo/nome à esquerda, alternador de tema e botão Entrar/menu da conta à direita. Rodapé discreto com privacidade e termos.

### 8.6 Responsividade (desktop, tablet e celular)

Abordagem mobile-first, com três faixas de referência: celular (até 639px), tablet (640 a 1023px) e desktop (1024px ou mais). Nenhuma tela deve ter rolagem horizontal, em nenhuma faixa.

- **Desktop (≥1024px):** conteúdo centralizado com largura máxima de cerca de 1200px. Na entrada, "Descrição da vaga" e "Seu currículo" lado a lado. No resultado, duas colunas: à esquerda o card de match, as palavras-chave e o painel "O que mudou e por quê"; à direita a pré-visualização do currículo, fixa (sticky) durante a rolagem, com a barra de exportação no topo dela.
- **Tablet (640 a 1023px):** na vertical, coluna única com cards largos e as keywords em duas colunas. Na horizontal, comporta-se como o desktop, com espaçamentos menores. Áreas de toque generosas, pois o uso é por toque.
- **Celular (<640px):** coluna única. Os dois campos de texto empilhados, de largura total. O resultado organizado em abas (controle segmentado) "Resumo", "Palavras-chave", "Currículo" e "Mudanças", para evitar uma página gigante. Barra fixa na parte inferior com as ações principais (Exportar e Copiar). A pré-visualização do currículo ajusta-se à largura da tela, com opção "Ver em tela cheia".
- **Em todas as faixas:**
  - Alvos de toque de no mínimo 44x44px; campos com fonte de 16px ou mais.
  - Nada que dependa só de hover: tudo o que aparece ao passar o mouse também funciona ao tocar.
  - Respeitar as áreas seguras do celular (safe-area, entalhes e barra inferior) e usar altura de viewport dinâmica (dvh), sem cortar o teclado virtual.
  - Tabelas viram cards empilhados em telas estreitas; gráficos se adaptam à largura.
  - Incluir a meta viewport correta, cor de tema (theme-color) e ícone de aplicativo, para uma boa experiência ao salvar o site na tela inicial.
  - Testar mentalmente os tamanhos 375px (celular), 768px (tablet) e 1280px (desktop) em cada tela.

### 8.7 Acessibilidade e tom de voz

- Contraste adequado (WCAG AA), foco visível em todos os elementos interativos, labels em todos os campos, navegação completa por teclado, atributos ARIA nos componentes dinâmicos (abas, popovers, medidor de score, mensagens de erro).
- Tom de voz: direto, encorajador e honesto. Nunca prometa emprego nem "100% de aprovação".
- Tratamento de erros em pt-BR: texto vazio, texto curto demais para ser um currículo ou uma vaga, falha da IA (com botão tentar novamente), limite de tamanho excedido.
- Limite de uso por usuário e por IP nas Edge Functions para evitar abuso, com mensagem clara ao atingir o limite.

## 9. Segurança e privacidade

- Nenhuma chave de API no front-end. Segredos apenas nos secrets das Edge Functions.
- Validação de entrada (tamanho, tipo) nas Edge Functions.
- Currículos contêm dados pessoais: não registrar o conteúdo em logs, não usar os dados para nenhuma outra finalidade, e exibir uma política de privacidade curta explicando o que é salvo (e que, em modo convidado, nada é salvo).
- RLS ativada em todas as tabelas.

## 10. Ordem de implementação

Implemente nesta ordem e garanta que cada etapa funcione antes de avançar:

1. Design system (tokens de cor, fontes, componentes-base, tema claro/escuro e layout responsivo) e, sobre ele, o núcleo em modo convidado: entrada, análise, score, keywords, currículo otimizado, verificação de fidelidade, painel de mudanças, cópia como texto.
2. Exportação em PDF (texto real) e DOCX.
3. Login com política de senha forte e confirmação de e-mail, banco e histórico.
4. Dashboard de evolução.
5. Modos Tecnologia e Primeiro emprego.

Critérios de aceite do núcleo: com uma vaga e um currículo reais, o app devolve score coerente, lista keywords encontradas e faltantes com evidências, gera um currículo em que TODO item tem evidência no original, e nunca adiciona uma skill ausente sem a confirmação explícita da pessoa. A interface deve estar agradável e utilizável em 375px, 768px e 1280px de largura, nos temas claro e escuro.
