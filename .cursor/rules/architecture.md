# Padrões de Arquitetura e Domínio

Diretrizes obrigatórias para a estrutura de código e lógica de domínio.

## 🏗 Camadas e Mappers
- **Isolamento de Domínio**: É OBRIGATÓRIO o uso de mappers para isolar o domínio de dados externos.
- **Mappers Padrão**:
  - `mapDbToDomain`: Banco de dados -> Domínio.
  - `mapAiToDomain`: IA -> Domínio.
- **Localização**: `lib/domain/[entidade]/mapper.ts`.

## 🔤 Nomenclatura
- **Padrão Principal**: `snake_case` para interfaces de domínio e banco de dados (compatibilidade direta com Supabase).
- **Exceção**: `camelCase` apenas em componentes de UI onde for explicitamente adotado.

## 🔐 Multi-tenancy
- **Fonte de Verdade**: `stores.owner_user_id`.
- **Isolamento**: Resolução de loja SEMPRE via servidor (`auth.uid()`). Nunca confiar em IDs de loja vindos do cliente em rotas sensíveis.
