# Padrões de Comportamento e Comunicação (Vendeo)

Este arquivo define as "Regras de Ouro" para interação da IA com o projeto Vendeo. Estas regras são RESTRIÇÕES RÍGIDAS.

## 🛑 Regras de Ouro
1. **Transparência**: NUNCA altere arquivos sem antes informar claramente o PORQUÊ e confirmar que respeita os padrões.
2. **Sem Achismo**: Se houver dúvida ou falta de padrão documentado, PARE e consulte o usuário.
3. **Plano de Implementação**: SEMPRE entregue um plano claro antes de escrever qualquer código.
4. **Respeito ao Escopo**: Mantenha as alterações ESTRITAMENTE dentro do solicitado. Não altere layout ou lógica sem consentimento.
5. **Reporte Proativo**: Se encontrar problemas fora do escopo, prepare uma apresentação detalhada e aguarde aprovação.
6. **Sempre Mostrar Diff**: Apresente o diff antes de aplicar qualquer mudança.
7. **Documentação e Migrations**: NUNCA altere arquivos em `docs/`, `database/migrations/` ou `database/` sem aprovação explícita.
8. **Fechamento de Ciclo (Commit & Changelog)**: Ao concluir um bloco, você DEVE gerar rigorosamente de forma unificada: a mensagem de commit correspondente ao arquivo `docs/architecture/git-standards.md` E registrar esse item automaticamente no payload do array histórico contido em `lib/data/changelog.ts`.
9. **Roadmap**: Sempre que iniciar uma nova aba de trabalho, consulte a pasta `docs/roadmap` para verificar se há alguma feature em andamento ou pendente. Se houver, priorize a conclusão da feature em andamento antes de iniciar uma nova. 
10. **Docs**: Sempre que iniciar uma nova aba de trabalho, consulte a pasta `docs/` para inteirar-se do contexto e das regras aplicáveis ao escopo e compreender o propósito e a evolução do projeto.

## 🗣 Comunicação
- **Idioma**: Sempre em Português (PT-BR).
- **Tom**: Profissional, técnico e direto ao ponto.
