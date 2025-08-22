# Refatoração MySnack (Next.js App Router)

Este pacote adiciona rotas **Início**, **Categorias**, **Pedidos** e **Perfil** ao projeto Next.js (App Router) existente.

## Tecnica adotada
- Conversão rápida: os HTMLs fornecidos foram montados como `srcDoc` em um `<iframe>` em páginas Next.js, garantindo fidelidade visual imediata.
- Estrutura Next: páginas criadas em `src/app/{rota}/page.tsx`.
- Navbar leve (`src/components/Navbar.tsx`) adicionada ao `src/app/layout.tsx`.

## Rotas
- `/` → Início
- `/categorias`
- `/pedidos`
- `/perfil`

## Rodando
```bash
npm install
npm run dev
```

> Em uma próxima etapa, podemos migrar cada HTML para JSX sem iframe, compondo componentes reutilizáveis.


## Atualização
Agora as páginas usam **JSX real** (sem iframe), reutilizando componentes existentes (Stores, Order, Auth) e mantendo o estilo Tailwind.


## Navegação inferior
O menu principal foi movido para a **parte inferior** (BottomNav), com abas Início, Categorias, Pedidos e Perfil, para espelhar o layout dos HTMLs originais.


## Tema e cores
As páginas **Início** e **Categorias** foram alinhadas ao visual original com tokens de marca em `globals.css`. Ajuste `--brand-*` para chegar ao 1:1 exato dos HTMLs.
