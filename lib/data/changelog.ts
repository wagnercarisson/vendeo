export type ChangeType = "feat" | "fix" | "refactor" | "perf" | "chore" | "docs" | "style";

export type ChangelogItem = {
    type: ChangeType;
    scope?: string;
    description: string;
};

export type ChangelogRelease = {
    version: string;
    date: string; // ex: "2026-03-30"
    title: string;
    description?: string;
    changes: ChangelogItem[];
};

export const changelogData: ChangelogRelease[] = [
    {
        version: "v1.0.0-beta.6",
        date: "2026-04-10",
        title: "Motor Visual — Qualidade de Imagem e Refinamento Semântico",
        description: "Expansão do contrato de leitura visual com métricas de qualidade de imagem, suporte a productName composto e correção da semântica de category_only com targetBox obrigatória.",
        changes: [
            { type: "feat", scope: "visual-reader", description: "Adição de campos de qualidade ao contrato: imageQuality, visibility, framing e backgroundNoise." },
            { type: "fix", scope: "visual-reader", description: "Correção da semântica de category_only: detected=false com targetBox e matchedTarget obrigatórios." },
            { type: "fix", scope: "visual-reader", description: "Rejeição de boxes 1:1 para qualquer sceneType que não seja full_scene." },
            { type: "fix", scope: "visual-reader", description: "sceneType forçado para multiple_products quando ignoredElements.length > 0." },
            { type: "feat", scope: "visual-reader", description: "Suporte a productName composto no prompt (ex: 'Coca + Pão de Hambúrguer')." },
            { type: "fix", scope: "sandbox", description: "Remoção do painel de crop preview da página /sandbox." },
            { type: "fix", scope: "supabase", description: "Adaptação de createSupabaseServerClient para Next.js 15 (cookies async) em 13 chamadores." }
        ]
    },
    {
        version: "v1.0.0-beta.5",
        date: "2026-04-09",
        title: "Motor de Leitura Visual — Sandbox v1",
        description: "Implementação isolada do motor de leitura visual de imagens de produto, com suporte multimodal, detecção de correspondência semântica e localização espacial via bounding box normalizada.",
        changes: [
            { type: "feat", scope: "visual-reader", description: "Contratos Zod com matchType (exact, category_only, none) e validação superRefine de consistência." },
            { type: "feat", scope: "visual-reader", description: "Prompt multimodal com calibração de cena, regras de bounding box, sistema de coordenadas e matching por marca/formato/volume." },
            { type: "feat", scope: "visual-reader", description: "Pipeline de validação pós-modelo: normalização de box, posição, occupancy, sceneType e matchedTarget." },
            { type: "feat", scope: "sandbox", description: "Rota API POST /api/sandbox/visual-reader/crop e página de preview com overlay e crop simulado." },
            { type: "chore", scope: "visual-reader", description: "Troca de gpt-4o-mini para gpt-4.1 no motor de leitura visual para maior precisão espacial." }
        ]
    },
    {
        version: "v1.0.0-beta.4",
        date: "2026-04-01",
        title: "Calibração Engine: Master Solid e Biometria",
        description: "Revolução na precisão do motor gráfico com a injeção do construtor de fatores dinâmicos (U), transicionando valores engessados do Solid para eixos escalonados em tempo real pelo DOM do cliente.",
        changes: [
            { type: "feat", scope: "canvas", description: "Implementação da calibração métrica, escala e top/left tracking para o Badge, Nome e Headline no Solid." },
            { type: "fix", scope: "canvas", description: "Sincronização dinâmica de tracking, line-height e largura da Headline e Subtítulo no layout Solid." },
            { type: "fix", scope: "canvas", description: "Calibração biométrica completa do rodapé (Linha, Endereço, WhatsApp e CTA) via Fator Dinâmico (U)." },
            { type: "fix", scope: "preview", description: "Ativação de refs híbridas e isolamento de biometria no ArtViewer para suporte universal a componentes Solid." },
            { type: "refactor", scope: "renderer", description: "Substituição total de coordenadas fixas por eixos escalonados em tempo real pelo DOM do cliente." }
        ]
    },
    {
        version: "v1.0.0-beta.3",
        date: "2026-03-31",
        title: "Selos Dinâmicos e Preços Opcionais",
        description: "Liberdade estratégica para campanhas de novidade, lançamento e combos, sem a obrigatoriedade de exibição de preço fixo.",
        changes: [
            { type: "feat", scope: "Renderer", description: "Implementação de badge dinâmico (OFERTA, NOVIDADE, etc) no Canvas." },
            { type: "feat", scope: "Wizard", description: "Campo de preço tornado opcional para todos os tipos de conteúdo." },
            { type: "feat", scope: "Database", description: "Adição da coluna 'price_label' (Migration 016)." },
            { type: "feat", scope: "UI", description: "Estúdio de Ajuste Fino na Revisão para troca de selos em tempo real." },
            { type: "docs", scope: "Architecture", description: "Atualização de ADR e Diagramas ERD." }
        ]
    },
    {
        version: "v1.0.0-beta.2",
        date: "2026-03-31",
        title: "Expansão Institucional e Polimento de Interface",
        description: "Inauguramos a presença institucional completa com as páginas legais e de contato, além de resolvermos gargalos de renderização na dashboard.",
        changes: [
            { type: "feat", scope: "system", description: "Implementação das páginas institucionais de Termos de Uso (/terms), Privacidade (/privacy) e Contato (/contact) com suporte@vendeo.tech." },
            { type: "fix", scope: "dashboard", description: "Correção técnica de overflow em tooltips da Sidebar utilizando React Portals (createPortal), garantindo visibilidade total na dashboard colapsada." },
            { type: "feat", scope: "contact", description: "Configuração de roteamento de e-mail suporte@vendeo.tech para atendimento centralizado." }
        ]
    },
    {
        version: "v1.0.0-beta.1",
        date: "2026-03-30",
        title: "Calibração Visual e Novo Motor Canvas",
        description: "Encerramos este ciclo com um pacote de refinamentos arquiteturais e de interface visando qualidade premium para a renderização de campanhas.",
        changes: [
            { type: "feat", scope: "landing", description: "Nova seção dinâmica 'Exemplos' com comparador antes/depois interativo de alta conversão." },
            { type: "fix", scope: "canvas", description: "Calibração milimétrica do Layout Split (Alinhamento em eixo Zigue-Zague corrigido, traço divisor ajustado para 7px e extinção do truncamento de nomes de loja longos)." },
            { type: "refactor", scope: "domain", description: "Finalização unificada da transição para Domain-Driven Architecture nos mappers de campanhas e injeção central." },
            { type: "feat", scope: "system", description: "Inauguração do mural de Changelog (Histórico da Plataforma) conectando publico e dashboard, baseado no padrão de commits." },
            { type: "style", scope: "landing", description: "Otimização responsiva completa no seletor do showcase: reposicionamento integrado ao slider e adoção nativa do anti-wrap (botões 13px roláveis horizontalmente) curando colapsos no mobile." }
        ]
    }
];

export const formatChangeType = (type: ChangeType) => {
    switch (type) {
        case "feat": return { label: "Novo", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
        case "fix": return { label: "Correção", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" };
        case "refactor": return { label: "Melhoria", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
        case "perf": return { label: "Performance", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" };
        case "chore": return { label: "Tech", color: "bg-zinc-100 text-zinc-600 border-zinc-200" };
        case "docs": return { label: "Documentação", color: "bg-sky-500/10 text-sky-600 border-sky-500/20" };
        case "style": return { label: "Visual", color: "bg-pink-500/10 text-pink-600 border-pink-500/20" };
        default: return { label: type, color: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20" };
    }
};
