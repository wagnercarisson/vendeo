# Vendeo — Normalização dos Campos Estratégicos v1

## Objetivo

Este documento define a regra técnica oficial para os campos estratégicos usados em campanhas e planos semanais, com o objetivo de evitar inconsistências entre:

* frontend
* backend
* geração por IA
* planos semanais
* futuras evoluções do produto

---

# 1. CAMPOS ESTRATÉGICOS OFICIAIS

Os campos estratégicos padronizados do domínio de campanhas são:

* `product_positioning`
* `content_type` (Natureza da oferta)

Esses campos representam escolhas estruturadas do usuário e devem permanecer consistentes em toda a aplicação.

---

# 2. FONTE DE VERDADE

A fonte de verdade dos valores normalizados no frontend é:

`app/dashboard/campaigns/new/_components/constants.ts`

Constantes oficiais:

* `PRODUCT_POSITIONING_OPTIONS`
* `CONTENT_TYPE_OPTIONS`

Toda implementação futura que leia, exiba, valide, transmita, persista, bloqueie, compare ou reutilize esses campos deve consultar essa fonte antes de definir qualquer comportamento.

---

# 3. REGRA DE USO

## 3.1 Obrigatório

Todos os fluxos abaixo devem usar os mesmos valores normalizados:

* nova campanha
* edição de campanha
* preview de campanha
* geração de arte
* geração de vídeo
* planos semanais
* criação de campanha a partir de plano
* mapeadores
* formatadores
* validações
* APIs de geração
* documentação funcional e técnica

## 3.2 Proibido

Não é permitido:

* hardcode de valores estratégicos fora da fonte oficial
* criar listas paralelas equivalentes
* criar labels alternativas sem vínculo com as constantes
* converter texto livre em valor estratégico padronizado sem regra explícita
* usar campos textuais da loja como fallback automático dos campos estratégicos da campanha

---

# 4. DISTINÇÃO OBRIGATÓRIA ENTRE LOJA E CAMPANHA

## 4.1 Campo da loja

`stores.brand_positioning`

Semântica:
campo textual, livre e descritivo da identidade comercial da loja.

Exemplo:
`"a maior variedade do bairro"`

Esse campo serve como contexto institucional/comercial da loja.

Ele pode influenciar prompts, contexto de geração e identidade verbal, mas não deve ser tratado como valor estratégico padronizado.

## 4.2 Campo da campanha

`campaigns.product_positioning`

Semântica:
campo estratégico padronizado da campanha/produto.

Esse campo deve aceitar apenas valores oficiais definidos em:

`PRODUCT_POSITIONING_OPTIONS`

Exemplos atuais:
* `popular`
* `medio`
* `premium`
* `jovem`
* `familia`

---

# 5. REGRA CRÍTICA DE ISOLAMENTO SEMÂNTICO

A aplicação deve respeitar a seguinte regra:

`stores.brand_positioning` != `campaigns.product_positioning`

Isso significa que:

* um não substitui o outro
* um não serve de fallback automático para o outro
* um não pode ser persistido no lugar do outro
* um não pode ser inferido do outro sem regra oficial documentada

---

# 6. ESTADO "PADRÃO DA LOJA" NO BETA

Na UI de nova campanha, o estado visual "Padrão da loja" não corresponde a um valor normalizado persistido em campanha.

No beta atual, esse estado deve significar apenas:

* nenhuma escolha explícita de `product_positioning`
* uso do contexto geral da loja durante a geração
* ausência de conversão automática de `brand_positioning` em `product_positioning`

## Regra operacional

Se `product_positioning` estiver vazio ou ausente:

* isso não autoriza preencher o campo com `brand_positioning`
* isso não transforma texto livre da loja em valor estratégico
* isso apenas indica ausência de escolha explícita padronizada

---

# 8. NATUREZA DO CONTEÚDO (content_type)

Adicionado via Migration 015 para distinguir o formato técnico (campaign_type) da natureza comercial da oferta.

## 8.1 Valores Oficiais (CONTENT_TYPE_OPTIONS)

* `product`: Foco em venda de produto físico com preço.
* `service`: Foco em prestação de serviço ou experiência.
* `info`: Foco em avisos, curiosidades ou utilidade pública (sem foco direto em venda).

## 8.2 Regra de Consistência (Casos 1, 2 e 3)

1. **Sincronia**: Arte e Vídeo devem compartilhar o mesmo `content_type`.
2. **Imutabilidade**: Uma vez aprovados ambos os formatos, o campo é bloqueado.
3. **Correção**: Permite edição se apenas um dos formatos existir, visando corrigir erros de classificação inicial.

---

# 9. IMPACTOS ESPERADOS NO SISTEMA

* criação de campanha via plano semanal
* comparação entre brief do plano e campanha vinculada
* prompts de IA
* mapeadores de domínio
* serialização para API
* documentação funcional

---

# 8. EVOLUÇÃO FUTURA PREVISTA

Se o projeto desejar ter um posicionamento estratégico padrão por loja, isso deve ocorrer por meio de um campo estruturado e normalizado específico.

Exemplo conceitual futuro:

`stores.default_product_positioning`

Esse campo deverá:

* usar os mesmos valores oficiais de `PRODUCT_POSITIONING_OPTIONS`
* ter semântica explícita de fallback estratégico da loja
* ser documentado formalmente antes de entrar em produção
* ser criado via migration versionada, seguindo a regra de ouro do projeto

Até essa evolução existir, o único campo estratégico oficial de posicionamento no domínio de campanhas continua sendo:

`campaigns.product_positioning`

---

# 9. CHECKLIST PARA FUTURAS IMPLEMENTAÇÕES

Antes de alterar qualquer fluxo envolvendo estratégia, verificar:

1. O valor vem de `constants.ts`?
2. O campo pertence ao domínio correto (`store` vs `campaign`)?
3. Existe algum fallback automático indevido?
4. A UI está exibindo label de um valor realmente padronizado?
5. O plano semanal está trafegando o mesmo valor da campanha?
6. A documentação continua alinhada com o código atual?

Se qualquer resposta for "não sei", a implementação deve parar e ser validada antes de prosseguir.

---

# 10. RESUMO EXECUTIVO

Regra oficial do projeto:

* `stores.brand_positioning` = contexto textual da loja
* `campaigns.product_positioning` = estratégia padronizada da campanha
* a fonte de verdade dos valores padronizados está em `constants.ts`
* "Padrão da loja" no beta não é valor persistido de posicionamento
* nenhum texto livre da loja pode preencher automaticamente o posicionamento estratégico da campanha