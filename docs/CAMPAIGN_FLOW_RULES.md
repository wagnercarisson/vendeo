# Vendeo — Campaign Flow Rules

## 🎯 Objetivo

Este documento define as regras oficiais de comportamento do fluxo de campanhas no Vendeo, garantindo consistência entre UX, lógica de backend e evolução futura do produto.

---

# 1. MODELOS DE ESTADO DA CAMPANHA

## 1.1 Status de banco (persistência)

Os status persistidos no banco são:

* `draft` → campanha em construção (sem conteúdo aprovado)
* `ready` → campanha com conteúdo gerado (arte e/ou vídeo)
* `approved` → reservado para evolução futura

⚠️ Importante:
O banco NÃO representa diretamente o estado visual completo da campanha.

---

## 1.2 Status de UI (camada de apresentação)

A interface utiliza um modelo derivado:

* `complete` → arte + vídeo
* `art` → apenas arte
* `video` → apenas vídeo
* `content` → texto gerado sem arte/vídeo final
* `none` → sem conteúdo

📌 Regra:
Esses estados NÃO devem ser persistidos no banco.

---

# 2. PRÉ-GERAÇÃO (PRE-GENERATION MODE)

## 2.1 Definição

Estado da campanha antes de qualquer geração de conteúdo.

## 2.2 Condição

Uma campanha está em pré-geração quando:

* `status = draft`
* NÃO possui `image_url`
* NÃO possui conteúdo de vídeo

## 2.3 Comportamento esperado

A tela deve:

* Exibir hero da campanha
* Permitir edição dos campos base
* Exibir abas:

  * Arte
  * Vídeo
* Exibir estado vazio em ambas abas
* Permitir gerar:

  * arte IA
  * vídeo IA

📌 Regra:
O usuário pode escolher gerar arte OU vídeo primeiro.

---

# 3. EDIÇÃO DE CAMPANHA

## 3.1 Regra fundamental

Editar campanha NUNCA cria nova campanha.

Sempre:

→ UPDATE na campanha existente

---

## 3.2 Duplicação

Duplicar campanha é uma ação separada:

* ocorre apenas via botão "DUPLICAR"
* cria nova campanha com:

  * base copiada
  * conteúdos zerados
  * `status = draft`

---

# 4. SALVAR RASCUNHO (COMPORTAMENTO CONTEXTUAL)

## 4.1 Regra principal

Salvar rascunho é contextual à aba ativa.

---

## 4.2 Quando estiver na aba ARTE

Deve:

* limpar:

  * `image_url`
  * conteúdo gerado de arte
* manter:

  * conteúdo de vídeo existente

---

## 4.3 Quando estiver na aba VÍDEO

Deve:

* limpar:

  * dados de vídeo
* manter:

  * arte existente

---

## 4.4 Regra de status

Após salvar:

* se existir arte OU vídeo → `status = ready`
* se não existir nada → `status = draft`

---

# 5. APROVAÇÃO

## 5.1 Regra principal

Aprovar conteúdo:

* NUNCA cria nova campanha
* SEMPRE atualiza a campanha atual

---

## 5.2 Aprovação de arte

Atualiza:

* `image_url`
* campos de conteúdo de campanha

---

## 5.3 Aprovação de vídeo

Atualiza:

* campos de reels

---

# 6. ISOLAMENTO ENTRE ARTE E VÍDEO

## 6.1 Regra crítica

Operações em arte NÃO podem afetar vídeo.
Operações em vídeo NÃO podem afetar arte.

---

## 6.2 Exemplos

* editar arte → não apaga vídeo
* editar vídeo → não apaga arte
* salvar rascunho → afeta apenas a aba ativa

---

# 7. CAMPANHAS VINCULADAS A PLANOS

## 7.1 Regra

Se campanha estiver vinculada a um plano semanal:

### Bloquear:

* objective
* audience
* positioning

### Permitir:

* product_name
* price
* product_image_url

---

## 7.2 Objetivo

Garantir consistência entre planejamento estratégico e execução.

---

# 8. SEMÂNTICA DE IMAGENS

## 8.1 Campos

* `product_image_url` → imagem base do produto (input do usuário)
* `image_url` → arte final gerada pela IA

---

## 8.2 Regra

* `product_image_url` nunca deve ser sobrescrito pela IA
* `image_url` só existe após aprovação da arte

---

# 9. REGENERAÇÃO

## 9.1 Definição

Regenerar significa:

→ reexecutar IA sobre a mesma campanha

---

## 9.2 Regra

* NÃO cria nova campanha
* NÃO altera dados base automaticamente
* sobrescreve apenas conteúdo gerado

---

## 9.3 Importante

Regeneração ≠ variação visual

---

# 10. VARIAÇÃO DE IMAGEM (FUTURO)

## 10.1 Definição

Geração de múltiplas opções visuais para escolha do usuário.

---

## 10.2 Estado

* NÃO implementado no beta
* previsto para versões futuras

---

# 11. CÓDIGOS DE ERRO (PADRÃO FUTURO)

## 11.1 Objetivo

Facilitar suporte e diagnóstico via print do usuário.

---

## 11.2 Formato sugerido

VND-<MÓDULO>-<AÇÃO>-<ID>

Exemplos:

* VND-NC-OG-01
* VND-NC-SAVE-01
* VND-LIST-LOAD-01

---

## 11.3 Regra

Mensagens devem ser:

* amigáveis ao usuário
* acompanhadas de código interno

---

# 12. PRINCÍPIOS GERAIS

* Nunca perder conteúdo já gerado sem intenção explícita
* Separar claramente criação, edição e duplicação
* Evitar efeitos colaterais entre arte e vídeo
* Priorizar previsibilidade sobre automação agressiva
* Interface deve refletir o estado real da campanha

---

# ✔️ STATUS DO DOCUMENTO

Este documento reflete o comportamento consolidado após o hardening do fluxo de campanhas no pré-beta do Vendeo.
