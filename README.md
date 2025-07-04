# 🎮 Catálogo de Jogos - Augusto Games

Um catálogo moderno e responsivo de jogos desenvolvido com HTML, CSS e JavaScript.

## ✨ Funcionalidades

### 🛒 Sistema de Carrinho
- Adicionar jogos ao carrinho
- Remover itens individuais
- Limpar carrinho completo
- Finalizar compra com confirmação
- Cálculo automático do total
- Prevenção de itens duplicados

### 🔍 Sistema de Busca
- Busca por nome do jogo
- Busca por categoria
- Busca em tempo real
- Limpeza automática dos resultados

### 📱 Interface Responsiva
- Design adaptável para desktop, tablet e mobile
- Sidebars funcionais (esquerda e direita)
- Animações suaves e modernas
- Notificações interativas

### 🎨 Design Moderno
- Gradientes e sombras elegantes
- Animações de entrada para os cards
- Efeitos hover interativos
- Cores temáticas (dourado e azul)

## 🚀 Como Usar

1. **Abra o arquivo `app/index.html`** no seu navegador
2. **Navegue pelos jogos** nas seções "Favoritos" e "Ação"
3. **Adicione jogos ao carrinho** clicando no botão "Adicionar ao carrinho"
4. **Acesse o carrinho** clicando no ícone do carrinho no canto superior direito
5. **Pesquise jogos** usando a barra de busca
6. **Acesse o menu lateral** clicando no ícone do personagem

## 📁 Estrutura do Projeto

```
Catalogo_Jogos/
├── app/
│   ├── assets/          # Imagens e ícones
│   ├── css/            # Arquivos de estilo
│   ├── js/             # Arquivos JavaScript
│   └── index.html      # Página principal
├── Server_Catalogo_jogos/  # Backend em C# (opcional)
└── README.md           # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura da página
- **CSS3** - Estilização e animações
- **JavaScript (ES6+)** - Funcionalidades interativas
- **jQuery** - Manipulação do DOM
- **Flaticon** - Ícones
- **Responsive Design** - Design adaptável

## 🎯 Melhorias Implementadas

### ✅ Correções de Bugs
- Corrigido erro de sintaxe no HTML (`<divc>` → `<div>`)
- Criado arquivo `Cart.js` que estava faltando
- Removida funcionalidade duplicada do carrinho
- Corrigidos conflitos entre sidebars

### 🎨 Melhorias Visuais
- Design mais moderno com gradientes
- Animações de entrada para os cards
- Efeitos hover aprimorados
- Notificações elegantes
- Melhor contraste e legibilidade

### ⚡ Melhorias de Performance
- Lazy loading para imagens
- Otimização de animações CSS
- Código JavaScript mais eficiente
- Prevenção de itens duplicados no carrinho

### 📱 Melhorias de UX
- Feedback visual para todas as ações
- Navegação por teclado (ESC para fechar)
- Busca em tempo real
- Responsividade aprimorada
- Acessibilidade melhorada

## 🎮 Jogos Disponíveis

- **Ghost of Tsushima** - R$ 200,00
- **Elden Ring** - R$ 250,00
- **God of War** - R$ 150,00
- **God of War 2** - R$ 200,00
- **God of War 3** - R$ 250,00
- **God of War: 2018** - R$ 300,00
- **God of War: Ragnarok** - R$ 350,00
- **Demon Souls** - R$ 300,00

## 🔧 Personalização

### Adicionar Novos Jogos
Edite o array `games` no arquivo `app/js/Card-Games.js`:

```javascript
const games = [
    { 
        id: 9, 
        name: "Novo Jogo", 
        price: 299.00, 
        img: "assets/novo-jogo.webp", 
        category: "ação" 
    },
    // ... outros jogos
];
```

### Alterar Cores
Modifique as variáveis CSS no arquivo `app/css/home.css`:

```css
:root {
    --primary-color: #ffd700;
    --secondary-color: #3498db;
    --background-color: #2c3e50;
}
```

## 🚀 Próximas Funcionalidades

- [ ] Sistema de login/registro
- [ ] Lista de desejos
- [ ] Sistema de avaliações
- [ ] Filtros por categoria
- [ ] Sistema de moedas
- [ ] Integração com backend
- [ ] Página de detalhes do jogo
- [ ] Sistema de promoções

## 👨‍💻 Desenvolvedor

**Augusto Farias dos Santos** - Estudante de TADS

## 📄 Licença

© Augusto Farias dos Santos - Todos os direitos reservados.

---

*Desenvolvido com ❤️ para o curso de TADS*