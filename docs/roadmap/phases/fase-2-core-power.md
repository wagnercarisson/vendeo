# 🎨 Feature — Variabilidade Visual

## 🎯 Objetivo

Garantir que as artes geradas pelo Vendeo sejam visualmente distintas entre diferentes lojas.

O sistema deve evitar a sensação de:

👉 template genérico
👉 repetição
👉 baixa personalização

---

## 🧠 Problema identificado

Atualmente:

* artes podem parecer iguais entre usuários
* layouts seguem padrão rígido
* falta identidade visual própria

Impacto:

* redução de percepção de valor
* sensação de produto “automatizado demais”
* menor confiança no conteúdo

---

## 💡 Estratégia

Introduzir variabilidade controlada na geração de arte.

A variação deve ser:

👉 automática
👉 consistente por loja
👉 diversa entre lojas

---

## 🧩 Escopo desta feature

---

### 1. Variabilidade de Layout

Alterar automaticamente:

* posição do título
* posição do preço
* posição do CTA
* alinhamento da imagem

Exemplos:

* topo / centro / base
* esquerda / centro / direita

---

### 2. Variabilidade de Estilo

Aplicar estilos diferentes na composição:

* moderno
* promocional
* elegante
* popular

Impacta:

* cores
* contraste
* tipografia aproximada
* uso de destaque

---

### 3. Identidade por Loja

Cada loja deve ter:

* padrão visual consistente
* “assinatura visual”

Possibilidades:

* cor predominante
* estilo preferencial
* variação controlada

---

## ⚠️ Regra obrigatória

* a mesma loja pode repetir estilo
* lojas diferentes NÃO devem gerar artes visualmente iguais

---

## ⚙️ Impacto técnico

### Motor de renderização

Arquivo relevante:

```bash
lib/graphics/renderer.ts
```

Ajustes necessários:

* introduzir variações de layout
* parametrizar posições de elementos
* permitir múltiplos templates base

---

### Dados da loja

Arquivo relevante:

```bash
lib/domain/stores/
```

Possível evolução:

* salvar preferências visuais
* definir estilo base por loja

---

### Geração de campanha

Arquivo relevante:

```bash
lib/domain/campaigns/
```

Ajustes:

* incluir parâmetros visuais na geração
* integrar com renderer

---

## 🖥️ Impacto no frontend

Nenhuma mudança obrigatória inicial.

Possíveis evoluções futuras:

* seleção de estilo (opcional)
* preview de variações

---

## 🧪 Regras de validação

A arte deve:

* ser visualmente coerente
* manter legibilidade
* evitar poluição visual
* manter hierarquia clara

---

## 📊 Métricas de sucesso

* aumento de percepção de qualidade
* redução de feedback negativo sobre repetição
* aumento de aprovação de campanhas
* maior retenção

---

## 🚫 Fora do escopo

* editor livre tipo Canva
* arrastar elementos manualmente
* customização avançada

---

## 📋 Tasks

### Backend / Render

* [ ] criar variações de layout
* [ ] parametrizar posições dos elementos
* [ ] implementar múltiplos templates base

---

### Identidade

* [ ] definir padrão visual por loja
* [ ] criar lógica de consistência

---

### Integração

* [ ] conectar geração de campanha ao renderer
* [ ] garantir variação automática

---

### Testes

* [ ] gerar artes para múltiplas lojas
* [ ] validar diferenciação visual
* [ ] validar consistência por loja

---

## 🎯 Resultado esperado

Cada loja passa a ter:

👉 identidade visual própria
👉 diferenciação perceptível
👉 maior valor percebido

---
