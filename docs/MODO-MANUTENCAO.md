# 🛠️ Sistema de Modo Manutenção

Sistema simples para colocar o Vendeo fora do ar durante refatorações críticas.

## Como Funciona

O sistema usa o proxy Next.js (`proxy.ts`) que intercepta todas as requisições e redireciona para a página de manutenção quando ativado.

## Como Ativar

### 1. Ativar Modo Manutenção

Edite `.env.local`:

```bash
MAINTENANCE_MODE=true
```

### 2. Reiniciar o Servidor

```bash
# Se estiver em desenvolvimento
npm run dev

# Se estiver em produção (Vercel/outro host)
# Fazer deploy com a variável de ambiente MAINTENANCE_MODE=true
```

### 3. Verificar

Acesse qualquer rota do site → deve redirecionar para `/maintenance`

## Como Desativar

### 1. Desativar Modo Manutenção

Edite `.env.local`:

```bash
MAINTENANCE_MODE=false
```

### 2. Reiniciar o Servidor

```bash
npm run dev
```

## Personalizar a Página

Edite: `app/maintenance/page.tsx`

Você pode alterar:
- Mensagem principal
- Lista de ações sendo executadas
- Previsão de retorno
- Email de contato
- Cores e estilos

## Arquitetura

```
proxy.ts               # Intercepta requisições, redireciona se MAINTENANCE_MODE=true
app/maintenance/       # Página de manutenção estática
  └── page.tsx
.env.local            # Configuração (MAINTENANCE_MODE=true/false)
```

## Comportamento

**Quando ativado:**
- ✅ Todas as páginas redirecionam para `/maintenance`
- ✅ APIs continuam bloqueadas (exceto se permitir explicitamente)
- ✅ Assets estáticos (_next, imagens) continuam acessíveis
- ✅ Página de manutenção sempre acessível

**Quando desativado:**
- ✅ Sistema funciona normalmente
- ✅ `/maintenance` redireciona para home (evita bookmark quebrado)

## Produção (Vercel)

Para ativar em produção sem fazer deploy:

1. Acessar Vercel Dashboard
2. Settings → Environment Variables
3. Adicionar: `MAINTENANCE_MODE=true`
4. Redeploy automático ou manual

Para desativar: Mudar para `false` e redeploy.

---

**Criado para FASE 1: Motor V2 - Schema Clean**
