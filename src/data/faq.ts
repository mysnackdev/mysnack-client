/** FAQ ilustrado e pesquisável (somente literais em português). */
export type FaqItem = {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: "QR Code" | "Pagamento" | "Acompanhamento" | "Conta" | "Outros";
  /* Pequena etiqueta de ícone (unicode) para ilustrar sem depender de libs. */
  icone: string;
};

export const FAQ: FaqItem[] = [
  {
    id: "qr1",
    pergunta: "Como faço um pedido usando o QR Code da mesa?",
    resposta:
      "Aponte a câmera do celular para o QR Code da sua mesa. Ao abrir o link, confirme o número da mesa, escolha os itens do cardápio e toque em “Adicionar ao carrinho”. Quando terminar, toque em “Finalizar pedido”.",
    categoria: "QR Code",
    icone: "📷",
  },
  {
    id: "qr2",
    pergunta: "O QR Code não funcionou. E agora?",
    resposta:
      "Verifique a conexão com a internet e o foco da câmera. Se preferir, digite o código da mesa manualmente no topo do app (ícone de mesa). Em último caso, chame o atendimento pelo WhatsApp.",
    categoria: "QR Code",
    icone: "🆘",
  },
  {
    id: "pay1",
    pergunta: "Quais formas de pagamento estão disponíveis?",
    resposta:
      "As opções podem variar por loja. Em geral, aceitamos Pix, cartão (na entrega/retirada) e, quando disponível, pagamento no balcão. No checkout, as formas habilitadas aparecem automaticamente.",
    categoria: "Pagamento",
    icone: "💳",
  },
  {
    id: "pay2",
    pergunta: "Posso pagar depois?",
    resposta:
      "Depende da política da loja. Caso a opção 'Pagar no balcão' esteja disponível, você poderá finalizar o pedido e efetuar o pagamento presencialmente.",
    categoria: "Pagamento",
    icone: "⏱️",
  },
  {
    id: "track1",
    pergunta: "Como acompanho o status do meu pedido?",
    resposta:
      "Após finalizar, você verá uma linha do tempo com etapas como 'pedido realizado', 'confirmado' e 'sendo preparado'. Nós enviaremos alertas quando o status mudar.",
    categoria: "Acompanhamento",
    icone: "📦",
  },
  {
    id: "track2",
    pergunta: "Meu pedido não muda de status. O que fazer?",
    resposta:
      "Se o status estiver parado por muito tempo, você pode entrar em contato pela aba de pedidos ou usar o botão de ajuda. O time do estabelecimento irá verificar o andamento.",
    categoria: "Acompanhamento",
    icone: "⏳",
  },
  {
    id: "acc1",
    pergunta: "Preciso ter conta para pedir?",
    resposta:
      "Você pode navegar sem conta, mas para finalizar o pedido e acompanhar atualizações, pedimos um login rápido para vincular seus pedidos.",
    categoria: "Conta",
    icone: "👤",
  },
  {
    id: "acc2",
    pergunta: "Esqueci minha senha. E agora?",
    resposta:
      "Na tela de login, toque em 'Esqueci minha senha' e siga as instruções para criar uma nova com segurança.",
    categoria: "Conta",
    icone: "🔐",
  },
  {
    id: "misc1",
    pergunta: "Posso dividir pedidos entre mesas ou lojas?",
    resposta:
      "Sim. Se você escolher itens de lojas diferentes, o sistema cria um pedido para cada loja automaticamente. Você controla tudo pelo carrinho e pela aba de pedidos.",
    categoria: "Outros",
    icone: "🧾",
  },
];
