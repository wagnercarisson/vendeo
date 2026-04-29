# Vendeo | Motor de Leitura | Spec v1 (estado atual + evolução para composição)

## 1. Objetivo

Definir formalmente:

* o estado atual do motor de leitura
* os novos campos necessários
* regras de fallback
* impacto no fluxo de campanha
* critérios de aceite

Este documento serve como **fonte de verdade antes de qualquer implementação**.

---

## 2. Papel do Motor de Leitura

O motor de leitura é responsável por:

> Transformar uma imagem em sinais visuais estruturados para o motor de composição.

Ele **não decide layout**.

### Separação de responsabilidades

* **Reader** → observa
* **Composer (Visual Intent Resolver)** → decide
* **Renderer** → executa

---

## 3. Estado Atual do Motor de Leitura

O motor atual já resolve:

### 3.1 Detecção e correspondência

* `detected: boolean`
* `matchType`
* `matchedTarget`

### 3.2 Estrutura da cena

* `sceneType`
* `relevantCount`
* `ignoredElements`

### 3.3 Localização espacial

* `targetBox | null`
* `targetOrientation`
* `targetPosition`
* `targetOccupancy`

### 3.4 Confiança

* `confidence`
* `reasoningSummary`

---

## 4. Campos já evoluídos (obrigatórios)

Esses campos já fazem parte da evolução do reader e devem ser **considerados padrão oficial**:

* `imageQuality`
* `visibility`
* `framing`
* `backgroundNoise`

---

## 5. Novos Campos Necessários (para composição)

### 5.1 Fundo

#### `backgroundType`

Enum:

* `transparent`
* `solid`
* `simple`
* `complex`
* `unknown`

#### `hasBackground`

Enum:

* `true`
* `false`
* `unknown`

---

### 5.2 Integridade do sujeito

#### `subjectCutoff`

Enum:

* `none`
* `light`
* `moderate`
* `severe`

---

### 5.3 Potencial de composição

#### `safeExpansionPotential`

Enum:

* `low`
* `medium`
* `high`

---

### 5.4 Qualidade perceptiva

#### `focusClarity`

Enum:

* `low`
* `medium`
* `high`
* `unknown`

#### `visualIsolation`

Enum:

* `low`
* `medium`
* `high`
* `unknown`

---

## 6. Campo Derivado (fora do reader)

### `compositionType`

Valores:

* `text-dominant`
* `balanced`
* `product-dominant`

⚠️ Este campo **não pertence ao reader**.

Ele deve ser calculado pelo:

> Visual Intent Resolver (Reader + Campaign)

---

## 7. Regras de Fallback

### 7.1 Regra principal

Quando:

```
detected = false
```

O sistema deve usar:

> **dados da campanha como fonte principal de decisão**

---

### 7.2 Fallback por tipo de campanha

* Produto único → tratar como `single_product`
* Combo → tratar como `multiple_products`
* Informativo (`content_type = info`) → priorizar texto

---

### 7.3 Fallback de targetBox

* `matchType = none` → `targetBox = null`
* Nunca inventar bounding box

---

### 7.4 Fallback de composição

Ordem de decisão:

1. campanha
2. sinais mínimos da imagem
3. heurística conservadora

---

### 7.5 Fallback dos novos campos

Quando não detectado:

* `backgroundType = unknown`
* `hasBackground = unknown`
* `subjectCutoff = unknown`
* `safeExpansionPotential = low`
* `visualIsolation = low`
* `focusClarity = unknown`

---

### 7.6 Regra de segurança

> Fallback sempre deve ser **conservador**

Melhor limitar layout do que quebrar arte.

---

## 8. Impacto no Fluxo de Campanha

### 8.1 Fluxo macro NÃO muda

Permanece:

```
rascunho → gerar → editar → regenerar → aprovar
```

---

### 8.2 Geração de arte

Agora depende de:

* leitura espacial
* qualidade da imagem
* tipo de fundo
* integridade do produto

---

### 8.3 Regeneração

Reexecutar reader quando:

* imagem muda
* crop muda

NÃO reexecutar quando:

* apenas texto muda

---

### 8.4 Edição

* edição textual → não invalida leitura
* troca de imagem → invalida leitura

---

### 8.5 Campanhas sem imagem forte

Para:

* `info`
* parte de `service`

Reader deve ser:

> opcional / complementar

---

### 8.6 Persistência (Banco)

#### v1 (atual)

* Reader roda em runtime
* Não persistir leitura

#### v2 (futuro)

* Snapshot da leitura na campanha

---

## 9. Critérios de Aceite

### 9.1 Funcionais

1. Reader sempre retorna objeto válido
2. Funciona mesmo com `detected = false`
3. `targetBox` só existe quando válido
4. Campos novos sempre normalizados (enum)
5. Campos obrigatórios nunca ausentes

---

### 9.2 Integração

6. Composição NÃO usa texto livre (`reasoningSummary`)
7. Apenas campos estruturados
8. `compositionType` é determinístico
9. Fallback nunca bloqueia geração

---

### 9.3 Qualidade de saída

10. Produtos que ocupam toda a imagem não quebram layout
11. Fundo transparente tratado corretamente
12. Conteúdo informativo continua funcionando
13. Troca de imagem invalida leitura
14. Troca textual não reprocessa imagem

---

### 9.4 Arquitetura

15. Reader não decide layout
16. Composer não reinterpreta imagem
17. Renderer não contém regra de negócio

---

## 10. Decisão Arquitetural Final

O motor de leitura passa a ser:

> uma camada estruturada de interpretação visual

Responsável por:

* detectar
* qualificar
* contextualizar

E não por:

* decidir layout
* gerar arte
* inferir estratégia

---

## 11. Ordem de Implementação

1. Congelar este spec
2. Atualizar contracts.ts do reader
3. Ajustar prompt + parser
4. Implementar Visual Intent Resolver
5. Conectar ao renderer

---

## 12. Resumo Executivo

* O reader atual está funcional, mas incompleto para composição
* Novos campos adicionam inteligência visual real
* Fallback passa a ser guiado pela campanha
* Arquitetura fica limpa e escalável

---

**Fim do Spec**
