# Padrões de Interface (UI) e Frontend

Diretrizes para garantir a consistência visual e funcional do Vendeo.

## 🎨 Design System e Constantes
- **Fonte de Verdade Estratégica**: SEMPRE use `app/dashboard/campaigns/new/_components/constants.ts` para valores de `objective`, `audience` e `product_positioning`.
- **Tailwind CSS**: Use classes utilitárias seguindo a configuração do projeto (`tailwind.config.ts`).

## ⚠️ Tratamento e Rastreabilidade de Erros
- **Falhas de Geração**: Erros em gerações de IA (texto, imagem, vídeo) NUNCA devem ser silenciosos. Devem ser tratados e reportados de forma clara na UI.
- **Normalização e Identificação**: Todas as mensagens de erro exibidas ao usuário devem incluir, ao final, um identificador único entre colchetes para facilitar o suporte (ex: `[DASH-NEW-GEN]`).
- **Formato Recomendado**: `[SISTEMA-TELA-COMPONENTE]` ou `[CODIGO-UNICO]`.
  - Exemplo: "Não foi possível gerar a cópia da campanha. [CMP-NEW-GEN]"

## 🧩 Componentização
- Priorize a reutilização de componentes existentes em `components/ui/`.
- Mantenha a lógica de estado o mais próxima possível de onde ela é usada.
