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
        version: "v1.0.0-beta.4",
        date: "2026-04-01",
        title: "Calibração Engine: Master Solid e Biometria",
        description: "Revolução na precisão do motor gráfico com a injeção do construtor de fatores dinâmicos (U), transicionando valores engessados do Solid para eixos escalonados em tempo real pelo DOM do cliente.",
        changes: [
            { type: "feat", scope: "canvas", description: "Implementação da calibração métrica, escala e top/left tracking para o Badge, Nome e Headline no Solid." },
            { type: "fix", scope: "canvas", description: "Sincronização dinâmica de tracking, line-height e largura da Headline e Subtítulo no layout Solid." },
            { type: "fix", scope: "canvas", description: "Calibração biométrica completa do rodapé (Linha, Endereço, WhatsApp e CTA) via Fator Dinâmico (U)." },
            { type: "fix", scope: "preview", description: "Ativação de refs híbridas e isolamento de biometria no ArtViewer para suporte universal a componentes Solid." },
            { type: "refactor", scope: "renderer", description: "Substituição total de coordenadas fixas por eixos escalonados em tempo real pelo DOM do cliente." },
            { type: "fix", scope: "canvas", description: "Aplicação exclusiva de espelhamento com fator dinâmico (biometria) na renderização do CTA do layout Split." },
            { type: "fix", scope: "canvas", description: "Correção biométrica do ícone e número de WhatsApp, assegurando medição isolada sem fusão de margens no layout Split." },
            { type: "feat", scope: "canvas", description: "Implementação da aderência dinâmica e aumento da legibilidade (+1px) para o campo de Endereço no layout Split." },
            { type: "fix", scope: "preview", description: "Refatoração híbrida do extrator biométrico, blindando as métricas absolutas do Split sem corromper as regras dos layouts Solid e Floating." },
            { type: "feat", scope: "canvas", description: "Injeção construtiva de biometria inteligente para Selo e Preço no layout Split, com emulação paramétrica perfeita de eixos e letter-spacing." }
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
