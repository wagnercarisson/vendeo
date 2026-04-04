# Migration 017 — Raciocínio Arquitetural

## Contexto

Conforme feedback de lojistas reais (especialmente do segmento de tintas e construção), a necessidade de representar múltiplas unidades físicas é crítica. Lojistas com 3 ou 4 lojas não querem (ou não devem) ser forçados a criar 4 contas no Vendeo se a marca for a mesma.

## Decisão de Design: JSONB vs Tabela Relacionada

Para a primeira fase (Content Engine), optamos pelo uso de uma coluna `branches` do tipo `jsonb` na tabela `stores`.

### Vantagens (Por que JSONB agora?):
1.  **Agilidade de Desenvolvimento**: Não exige a criação de tabelas de junção ou complexidade de ORM neste estágio beta.
2.  **Flexibilidade**: Permite armazenar endereços, bairros e telefones específicos de cada unidade de forma semi-estruturada.
3.  **Performance**: Para um número pequeno de filiais (geralmente entre 2 e 5 para o público-alvo), o impacto é desprezível.

### Impactos Futuros:
- No futuro, se o Vendeo evoluir para um SaaS de franquias completo (Fase 3 - Digital Agency), esta coluna poderá ser migrada para uma tabela `store_locations` com chaves estrangeiras.

## Padrão de Dados

Cada item no array `branches` seguirá a interface:
```ts
{
  id: string (uuid),
  name: string (ex: "Unidade Brusque"),
  address: string,
  neighborhood: string,
  city: string,
  state: string,
  whatsapp: string (opcional para a unidade),
  is_main: boolean
}
```
