# 🛡️ Vendeo Beta: Central de Acompanhamento

Este documento é a sua "Torre de Controle" para analisar os dados gerados pelos usuários Beta e transformar feedbacks qualitativos em melhorias reais no produto.

## 📊 KSFs (Key Success Factors) para o Beta
Fique atento a estas métricas fundamentais no seu console Supabase:
1. **NPS Interno (Score):** Mantenha a média acima de 8.0.
2. **Índice de "Postaria":** Quantos Betas disseram "Sim" ou "Talvez" no campo `would_post`.
3. **Mapeamento de Falhas (Hallucinations):** Use o `campaign_id` para identificar por que a IA errou (ex: confundir "Novidade" com "Oferta").

## 🔍 Caderno de Análise de Feedback (Logs de Campo)
*Utilize este espaço para consolidar o que você está aprendendo com os Betas.*

| Usuário | Campanha ID | Nota | O que aprendemos? | Status |
| :--- | :--- | :--- | :--- | :--- |
| Admin | `84b3c0b7...` | 5 | IA confundiu objetivo "Novidade" com layout de "Oferta". | ⏳ Ajustar Prompt |
| | | | | |

## 🛠️ Roteiro de Depuração de IA
Quando receber uma nota baixa (<7), siga este processo:
1. Copie o `campaign_id` da tabela `feedback_messages`.
2. Busque o registro na tabela `campaigns`.
3. Analise o `ai_text` vs o `objective` e `product_positioning`.
4. **Hipótese:** O prompt de `renderCampaignArt` precisa ser mais rígido sobre o uso de "badges" de preço em posts de pura imagem/novidade.

## 🚀 Roadmap para V0.2 (Pós-Beta)
*Ideias nascidas do feedback inicial:*
- [ ] **Trava de Preço:** Não exibir o Badge se o preço for zero ou nulo (ajuda em posts de "Novidade").
- [ ] **Seleção de Layout:** Permitir que o usuário escolha entre 3 estilos de arte antes da geração final.
- [ ] **Modo "Voz do Dono":** IA aprende com as edições manuais que o usuário faz nas legendas.

---
> [!IMPORTANT]
> O segredo de um Beta de sucesso não é não ter erros, mas quão rápido você aprende com eles e ajusta o motor da IA. Boa sorte com os primeiros usuários!
