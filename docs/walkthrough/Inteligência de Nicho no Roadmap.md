# Walkthrough — Inteligência de Nicho no Roadmap

Formalizamos a **Camada Semântica de Nicho** como um pilar central do Vendeo. Agora, o roadmap reflete como a IA se adaptará aos diferentes ramos de atividade (incluindo o novo caso de teste: **Farmácia**).

## O Que Mudou

### 1. Roadmap Principal
- **Novo Diferencial**: Adicionada a seção "A Camada Semântica de Nicho" no [readme.md](file:///g:/Projetos/vendeo/docs/roadmap/readme.md). 
- O Vendeo agora é definido pela intersecção entre **Segmento**, **Posicionamento** e **Tom de Voz**.

### 2. Fase 1 — Content Engine
- A feature de Copywriting foi expandida para incluir o suporte a **objetivos estratégicos** (Venda vs. Autoridade) baseados no nicho.
- Documentado em [fase-1-utility-tool.md](file:///g:/Projetos/vendeo/docs/roadmap/phases/fase-1-utility-tool.md).

### 3. Feature: Inteligência de Nicho & Copywriting
- O arquivo [copywriting-core.md](file:///g:/Projetos/vendeo/docs/roadmap/features/copywriting-core.md) foi reescrito para detalhar três grandes grupos de nicho:
    1. **Venda/Giro**: Supermercados, Conveniência.
    2. **Consultivo**: Tintas, Farmácia (inserido conforme solicitado).
    3. **Lifestyle**: Boutique, Adega, Pet Shop.
- **Exemplo Prático**: Inserido o caso da Farmácia (Vitamina C) como modelo de como a IA deve "pensar" agora.

### 4. Conteúdo Informativo
- Reforçada a necessidade de a IA assumir o papel de "Consultor do Nicho" em postagens estratégicas no [informativo.md](file:///g:/Projetos/vendeo/docs/roadmap/features/informativo.md).

---

## 🎯 Impacto no Próximo Desenvolvimento

Com essas definições no roadmap, a próxima etapa técnica (refinar o prompt de IA) já possui as "regras de negócio" claras:
- **Priorizar Autoridade** para Tintas e Farmácia.
- **Priorizar Giro** para Mercados.
- **Priorizar Desejo** para Adegas e Pet Shops.

> [!TIP]
> O roadmap agora serve como guia direto para o `prompts.ts`, onde usaremos as variáveis `main_segment` e `brand_positioning` para injetar esse "conhecimento de nicho".
