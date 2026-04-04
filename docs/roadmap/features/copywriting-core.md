# ✍️ Feature — Inteligência de Nicho & Copywriting

## 🎯 Objetivo

Transformar a geração de texto do Vendeo em uma inteligência de agência que entende as regras de negócio de cada setor.

A IA deve deixar de apenas sugerir legendas e passar a servir como uma **camada semântica estratégica**.

---

## 🧠 Problema atual

*   IA soa genérica para negócios técnicos.
*   Não diferencia o objetivo de "Venda Direta" (Supermercado) do objetivo de "Autoridade/Educação" (Tintas, Farmácia).
*   Não utiliza o "Posicionamento de Marca" configurado pelo lojista para dar o tom da mensagem.

---

## 🧩 Camada de Inteligência por Nicho

A IA deve adaptar a estratégia de copy conforme o segmento da loja:

### 1. Nichos de Venda (Supermercado, Conveniência, Hortifruti)
*   **Foco:** Giro, Preço, Volume e Praticidade.
*   **Gatilhos:** "Fim de Semana", "Churrasco", "Economia", "Oferta Relâmpago".
*   **Tom:** Direto e vibrante.

### 2. Nichos Consultivos (Tintas, Materiais de Construção, Farmácia)
*   **Foco:** Solução, Autoridade técnica, Educação e Segurança.
*   **Gatilhos:** "Renove sua casa", "Proteção para sua família", "Dica de Especialista".
*   **Tom:** Útil, confiável e sereno.

### 3. Nichos de Lifestyle (Boutique, Adega, Pet Shop)
*   **Foco:** Prazer, Exclusividade, Status e Relacionamento.
*   **Gatilhos:** "Seu momento", "Seleção Premium", "Só pra quem entende".
*   **Tom:** Sofisticado ou Descontraído (dependendo do tom de voz configurado).

---

## ⚙️ Regras de Geração (Prompt Engine)

Toda geração deve considerar agora:
1.  `stores.main_segment`
2.  `stores.brand_positioning`
3.  `stores.tone_of_voice`
4.  `campaigns.content_type` (produto vs. informativo)

### Exemplo Prático: Farmácia
*   **Entrada:** Post sobre Vitamina C. 
*   **IA Sem Nicho:** "Vitamina C em oferta, venha conferir."
*   **IA com Inteligência de Nicho:** "Prepare sua imunidade para a mudança de estação. 🍊 Especialistas recomendam a Vitamina C para reforçar as defesas do seu organismo. Temos as melhores opções para sua família."

---

## 📋 Checklist de Implementação (IA)

- [ ] Incluir `main_segment` nas variáveis do prompt.
- [ ] Criar blocos de instruções específicas por grandes grupos de nicho (Venda vs. Consultivo).
- [ ] Forçar a inclusão do "Diferencial da Loja" (`brand_positioning`) no corpo da legenda para humanizar a postagem.
- [ ] Validar tom de voz para evitar termos proibidos em nichos sensíveis (ex: Farmácia).

---

## 📊 Métricas de Sucesso

*   Aumento do tempo de leitura da legenda (percepção de valor).
*   Feedback de lojistas de setores técnicos (Tintas, Farmácia) que sentem que a IA "finalmente os entende".
*   Maior conversão em posts tipo `info` (informativos).
