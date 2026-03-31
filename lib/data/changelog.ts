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
        version: "v1.0.0-beta.1",
        date: "2026-03-30",
        title: "Calibração Visual e Novo Motor Canvas",
        description: "Encerramos este ciclo com um pacote de refinamentos arquiteturais e de interface visando qualidade premium para a renderização de campanhas.",
        changes: [
            { type: "feat", scope: "landing", description: "Nova seção dinâmica 'Exemplos' com comparador antes/depois interativo de alta conversão." },
            { type: "fix", scope: "canvas", description: "Calibração milimétrica do Layout Split (Alinhamento em eixo Zigue-Zague corrigido, traço divisor ajustado para 7px e extinção do truncamento de nomes de loja longos)." },
            { type: "refactor", scope: "domain", description: "Finalização unificada da transição para Domain-Driven Architecture nos mappers de campanhas e injeção central." },
            { type: "feat", scope: "system", description: "Inauguração do mural de Changelog (Histórico da Plataforma) conectando publico e dashboard, com baseada no padrão de commits." },
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
