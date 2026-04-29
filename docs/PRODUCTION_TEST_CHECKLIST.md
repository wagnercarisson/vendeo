# Checklist de Testes de Produção — Vendeo Beta

Este guia deve ser seguido após o deploy para o domínio oficial (`vendeo.tech`) para garantir que todas as permissões de nuvem (Supabase, Vercel, OpenAI) estão 100% corretas.

## 1. Fluxo de Onboarding (Nova Loja)
- [ok ] **Criar nova conta**: Use um e-mail diferente do habitual para testar o fluxo de "primeiro acesso".
- [ok ] **Configurar Loja**: Preencha nome, cidade, segmento e tom de voz.
- [ok ] **Upload de Logo**: Tente subir uma imagem real para a logo. 
  - *Valida: Permissões de escrita no Bucket `campaign-images`.*
- [ok ] **Cores da Marca**: Altere as cores primária/secundária e salve.
  - *Valida: Persistência no banco de dados real.*

## 2. Fluxo de Planejamento (Weekly Wizard)
- [ok ] **Selecionar Semana**: Inicie o Wizard e selecione a semana atual/próxima.
- [ok ] **Gerar Estratégia**: Clique para gerar via IA.
  - *Valida: Conexão com OpenAI e timeout do servidor (Edge Functions).*
- [ok ] **Aprovar Plano**: Siga até o passo 3 e aprove o planejamento.
  - *Valida: Lógica de status `approved` e criação de `weekly_plan_items`.*

## 3. Fluxo de Campanha (Criação e Arte)
- [ok ] **Criar a partir do Plano**: No Passo 3 do Wizard, clique para criar uma campanha de um dos itens sugeridos.
- [ok ] **Upload de Foto de Produto**: Suba uma foto real do produto.
- [ok ] **Gerar Conteúdo**: Clique para a IA escrever a legenda e o roteiro de vídeo.
- [ok ] **Aprovar e Renderizar**: Clique em "Aprovar Conteúdo". 
  - *Valida: Renderização via Canvas, Upload da Arte Final e geração de **Signed URL**.*

## 4. Auditoria de Dados e Dashboard
- [ok ] **Ver no Dashboard**: A nova campanha aparece corretamente no gráfico/lista?
- [ok ] **Ver Arte**: Clique no botão "Ver Arte" na listagem. A imagem abre com o token de segurança na URL?
- [ok ] **Editabilidade**: Tente editar o preço de uma campanha já aprovada. O "Piso" da imagem antiga é rápido?

## 5. Limites de Segurança
- [ok ] **Isolamento**: Tente acessar um ID de campanha que pertença a outra conta pela URL direto (deve dar Erro 404/403).
- [ok ] **Rate Limit**: Se você tentar gerar planos muitas vezes seguidas (mais de 10 em 1 minuto), o sistema deve pedir para você aguardar.

---
> [!TIP]
> **Encontrou um erro?**
> Se algo falhar, anote:
> 1. O que você estava fazendo.
> 2. Qual foi o erro que apareceu (ou se a tela ficou branca).
> 3. O horário aproximado.
> Isso nos ajudará a depurar os logs da Vercel/Supabase.
