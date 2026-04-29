# Nota de Migração: @brand-consistency → @brand-designer

**Data:** 28 de Abril de 2026  
**Status:** ✅ Concluída  
**Razão:** Realinhamento conceitual — marketing vs técnico  

---

## 🔄 O Que Mudou

### Nome
- **ANTES:** `@brand-consistency`
- **DEPOIS:** `@brand-designer`

### Perfil
- **ANTES:** Designer especializado em sistemas de design (técnico)
- **DEPOIS:** Designer gráfico & branding (profissional de MARKETING)

### Foco Principal
- **ANTES:** Garantir consistência visual (aplicar sistema)
- **DEPOIS:** Criar reconhecimento instantâneo (<1 segundo) e sensação de pertencimento

---

## 🎯 Novas Responsabilidades

### 1. Reconhecimento Instantâneo
Cliente vê campanha → identifica loja em <1 segundo
**Métrica:** ≥85% accuracy

### 2. Diferenciação de Competidores
3 adegas no mesmo bairro → cada uma com DNA visual único
**Exemplo:** Adega Zé (azul profundo) vs Adega Silva (vermelho) vs Adega Central (verde)

### 3. Sensação de Pertencimento
Lojista vê campanha e sente "essa tem a cara da minha loja"
**Métrica:** ≥90% satisfação

### 4. Consistência Controlada
- 70% elementos fixos (cores, logo, tipografia) = reconhecimento
- 30% variação (composição, layout) = não enjoar

---

## 📋 Arquivos Atualizados

| Arquivo | Mudanças |
|---------|----------|
| [MARKETING-SQUAD-STRUCTURE-AIOX.md](MARKETING-SQUAD-STRUCTURE-AIOX.md) | Seção completa do agente reescrita |
| [MARKETING-SQUAD-EXECUTIVE-SUMMARY.md](MARKETING-SQUAD-EXECUTIVE-SUMMARY.md) | Tabela Core Squad + fluxo |
| [MARKETING-SQUAD-TECHNICAL-INTEGRATION.md](MARKETING-SQUAD-TECHNICAL-INTEGRATION.md) | Ponto 4 + responsabilidades + diagrama |
| [START-HERE-MARKETING-SQUAD.md](START-HERE-MARKETING-SQUAD.md) | Lista de agentes + fluxo visual |

---

## 🔑 Rationale

**Comentário do Product Owner:**
> "não estenderia essa função exclusiva de marketing para agentes técnicos, esse agente precisa ter o conhecimento de um profissional de marketing, com olho clínico para identificar melhores ajustes para destacar a marca e o visual da loja"

**Problema Identificado:**
- Nome "consistency" sugeria função técnica/operacional (aplicar regras)
- Perfil de "designer de sistemas" é técnico, não estratégico
- Faltava foco em BRANDING (reconhecimento de marca)

**Solução:**
- Renomear para "designer" = função criativa/estratégica
- Perfil de designer de branding = marketing
- Adicionar métricas de brand recognition e pertencimento
- Enfatizar diferenciação competitiva

---

## ✅ Checklist de Implementação Futura

Quando criar o agente @brand-designer:

- [ ] Agent profile em `.aiox-core/development/agents/brand-designer.md`
- [ ] Persona com expertise em BRANDING (não sistemas de design)
- [ ] Commands que incluem análise de competição
- [ ] Memory tracking de brand recognition scores
- [ ] Integration com `lib/graphics/composer/brand-designer.ts`
- [ ] Testes de reconhecimento com clientes reais (<1 segundo)
- [ ] Survey de pertencimento com lojistas ("cara da minha loja")

---

## 📚 Contexto Adicional

**Segmento Target:** Adegas + Mercearias (~60k lojas Brasil)

**Desafio:** 
- Lojas pequenas não têm budget para agência de branding
- Competição feroz no mesmo bairro (3-5 adegas vizinhas)
- Cliente precisa reconhecer loja instantaneamente no feed Instagram
- Lojista precisa sentir que campanha "tem a cara da loja dele"

**Solução @brand-designer:**
- Criar DNA visual único por loja (não template genérico)
- Garantir distinção visual de competidores
- Manter consistência (70%) + variedade (30%)
- Medir brand recognition objetivamente

---

**Migração concluída com sucesso em 28/04/2026** ✅
