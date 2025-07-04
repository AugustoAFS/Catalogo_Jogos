"use strict";

$(document).ready(function () {
    const API_BASE_URL = 'https://localhost:7155/api';
    
    // Configurar Axios
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    
    // Função para obter token de autenticação
    function getAuthToken() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }

    // Função para verificar se está autenticado
    function isAuthenticated() {
        return !!getAuthToken();
    }

    // Função para obter dados do usuário com fallback
    function getUserData() {
        const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
        
        console.log('🔍 Dados do usuário encontrados:', userData);
        console.log('🔍 Propriedades disponíveis:', Object.keys(userData));
        
        // Padronizar para Id_User
        const userId = userData.Id_User;
        
        console.log('🔍 ID do usuário extraído:', userId);
        
        if (userId) {
            return {
                ...userData,
                Id_User: userId // Garantir que sempre tenha a propriedade 'Id_User'
            };
        }
        
        return null;
    }

    // Função para fazer requisições autenticadas
    async function authenticatedRequest(config) {
        const token = getAuthToken();
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }

        const authConfig = {
            ...config,
            headers: {
                ...config.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 segundos de timeout
        };

        console.log('📡 Fazendo requisição:', {
            method: authConfig.method,
            url: authConfig.url,
            data: authConfig.data,
            headers: authConfig.headers
        });

        try {
            const response = await axios(authConfig);
            return response;
        } catch (error) {
            console.error('❌ Erro na requisição autenticada:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: error.config
            });
            throw error;
        }
    }

    // Função para mostrar notificações
    function showNotification(message, type = 'info') {
        $('.notification').remove();
        
        const notification = $(`
            <div class="notification ${type}">
                <span>${message}</span>
            </div>
        `);
        
        $('body').append(notification);
        
        setTimeout(() => {
            notification.addClass('show');
        }, 100);
        
        setTimeout(() => {
            notification.removeClass('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Carregar carrinho da API
    async function loadCartFromAPI() {
        try {
            if (!isAuthenticated()) {
                showNotification('Faça login para acessar o carrinho', 'warning');
                return;
            }

            // Mostrar estado de loading
            const cartContainer = $('#cart-items');
            cartContainer.html(`
                <div class="cart-loading">
                    <i class="fi fi-rr-spinner"></i>
                    <p>Carregando carrinho...</p>
                </div>
            `);

            const userData = getUserData();
            
            console.log('🛒 Carregando carrinho para usuário:', userData);
            
            if (!userData || !userData.Id_User) {
                console.error('❌ Dados do usuário inválidos:', userData);
                showNotification('Dados do usuário não encontrados. Faça login novamente.', 'error');
                return;
            }
            
            console.log('📡 Fazendo requisição para:', `/Cart/${userData.Id_User}`);
            
            const response = await authenticatedRequest({
                method: 'get',
                url: `/Cart/${userData.Id_User}`
            });
            
            console.log('📦 Resposta do carrinho:', response.data);
            
            // Verificar se a resposta tem a estrutura esperada
            if (!response.data || !response.data.success) {
                throw new Error('Resposta inválida da API');
            }
            
            // A API retorna { success: true, data: { Items: [], TotalValue: 0, ItemCount: 0 } }
            const cartData = response.data.data;
            const cartItems = cartData.Items || [];
            
            console.log('📋 Itens do carrinho:', cartItems);
            console.log('💰 Valor total:', cartData.TotalValue);
            console.log('🔢 Quantidade de itens:', cartData.ItemCount);
            
            displayCartItems(cartItems, cartData.TotalValue, cartData.ItemCount);
            updateTotalPrice(cartItems, cartData.TotalValue);
            
            // Atualizar contador do carrinho se existir
            updateCartCounter(cartData.ItemCount);
            
        } catch (error) {
            console.error('❌ Erro completo ao carregar carrinho:', error);
            console.error('Status do erro:', error.response?.status);
            console.error('Dados do erro:', error.response?.data);
            
            // Se houver erro específico da API, mostrar
            if (error.response?.data?.message) {
                showNotification(error.response.data.message, 'error');
            } else if (error.message) {
                showNotification(error.message, 'error');
            } else {
                showNotification('Erro ao carregar carrinho', 'error');
            }
            
            // Fallback para carrinho local
            console.log('🔄 Usando fallback local...');
            loadCartFromLocal();
        }
    }

    // Adicionar item ao carrinho via API
    async function addToCartAPI(game, quantity = 1) {
        try {
            if (!isAuthenticated()) {
                showNotification('Faça login para adicionar itens ao carrinho', 'warning');
                return false;
            }

            const userData = getUserData();
            
            // Debug: verificar dados antes de enviar
            console.log('👤 Dados do usuário:', userData);
            console.log('🎮 Dados do jogo:', game);
            console.log('📦 Quantidade:', quantity);

            if (!userData || !userData.Id_User) {
                console.error('❌ Dados do usuário inválidos:', userData);
                showNotification('Dados do usuário não encontrados. Faça login novamente.', 'error');
                return false;
            }

            if (!game || (!game.Id_Game && !game.id_Game)) {
                console.error('Dados do jogo inválidos:', game);
                showNotification('Dados do jogo inválidos', 'error');
                return false;
            }

            // Garantir que os campos estejam corretos
            const requestData = {
                Id_User: userData.Id_User,
                Id_Game: game.Id_Game || game.id_Game,
                Quantity: quantity
            };

            console.log('📤 Dados da requisição (AddToCartDto):', requestData);

            const response = await authenticatedRequest({
                method: 'post',
                url: '/Cart',
                data: requestData
            });

            console.log('📥 Resposta da API:', response.data);

            const responseData = response.data;
            if (responseData && responseData.success) {
                const gameName = game.name_Game || game.Name_Game || 'Jogo';
                showNotification(`${gameName} adicionado ao carrinho!`, 'success');
                
                // Recarregar carrinho após adicionar item
                setTimeout(() => {
                    loadCartFromAPI();
                }, 500);
                
                return true;
            } else {
                const errorMessage = responseData?.message || 'Erro ao adicionar ao carrinho';
                showNotification(errorMessage, 'error');
                console.error('❌ Erro na resposta da API:', responseData);
                return false;
            }
        } catch (error) {
            console.error('❌ Erro completo ao adicionar ao carrinho:', error);
            console.error('Status do erro:', error.response?.status);
            console.error('Dados do erro:', error.response?.data);
            console.error('Mensagem do erro:', error.message);
            
            let message = 'Erro ao adicionar ao carrinho';
            
            if (error.response) {
                // Erro da resposta HTTP
                const status = error.response.status;
                const statusText = error.response.statusText;
                const data = error.response.data;
                
                console.error(`HTTP ${status}: ${statusText}`, data);
                
                if (status === 401) {
                    message = 'Sessão expirada. Faça login novamente.';
                } else if (status === 403) {
                    message = 'Acesso negado. Verifique suas permissões.';
                } else if (status === 404) {
                    message = 'Jogo não encontrado.';
                } else if (status === 409) {
                    message = 'Item já está no carrinho.';
                } else if (data?.message) {
                    message = data.message;
                } else {
                    message = `Erro ${status}: ${statusText}`;
                }
            } else if (error.request) {
                // Erro de rede
                console.error('Erro de rede:', error.request);
                message = 'Erro de conexão com o servidor. Verifique sua internet.';
            } else {
                // Erro na configuração da requisição
                console.error('Erro de configuração:', error.message);
                message = error.message || 'Erro desconhecido';
            }
            
            showNotification(message, 'error');
            return false;
        }
    }

    // Remover item do carrinho via API
    async function removeFromCartAPI(cartItemId) {
        try {
            console.log('🗑️ Removendo item do carrinho:', cartItemId);
            
            const response = await authenticatedRequest({
                method: 'delete',
                url: `/Cart/${cartItemId}`
            });

            const responseData = response.data;
            if (responseData.success) {
                showNotification('Item removido do carrinho!', 'success');
                loadCartFromAPI(); // Recarregar carrinho
                return true;
            } else {
                showNotification(responseData.message || 'Erro ao remover item', 'error');
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao remover do carrinho:', error);
            const message = error.response?.data?.message || 'Erro ao remover item';
            showNotification(message, 'error');
            return false;
        }
    }

    // Atualizar quantidade via API
    async function updateQuantityAPI(cartItemId, quantity, clickedBtn) {
        try {
            console.log('📊 Atualizando quantidade:', cartItemId, 'para', quantity);
            
            // Mostrar loading no botão clicado
            const originalContent = clickedBtn.html();
            clickedBtn.html('<i class="fi fi-rr-spinner"></i>').prop('disabled', true);
            
            const response = await authenticatedRequest({
                method: 'put',
                url: `/Cart/${cartItemId}`,
                data: {
                    Quantity: quantity
                }
            });

            const responseData = response.data;
            if (responseData.success) {
                // Atualizar interface visualmente
                const itemElement = $(`.cart-item[data-cart-id="${cartItemId}"]`);
                const quantityDisplay = itemElement.find('.quantity-display');
                const minusBtn = itemElement.find('.quantity-btn.minus');
                const subtotalElement = itemElement.find('.item-quantity span');
                
                quantityDisplay.text(quantity);
                
                // Atualizar botão minus (desabilitar se quantidade = 1)
                minusBtn.prop('disabled', quantity <= 1);
                
                // Atualizar subtotal
                const price = parseFloat(itemElement.find('.item-price').text().replace('R$ ', ''));
                const newSubtotal = (price * quantity).toFixed(2);
                subtotalElement.text(`R$ ${newSubtotal}`);
                
                // Recarregar total do carrinho
                loadCartFromAPI();
                
                // Feedback visual de sucesso
                itemElement.addClass('updated');
                setTimeout(() => itemElement.removeClass('updated'), 500);
                
                showNotification('Quantidade atualizada!', 'success');
                return true;
            } else {
                showNotification(responseData.message || 'Erro ao atualizar quantidade', 'error');
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar quantidade:', error);
            const message = error.response?.data?.message || 'Erro ao atualizar quantidade';
            showNotification(message, 'error');
            return false;
        } finally {
            // Restaurar botão
            clickedBtn.prop('disabled', false);
        }
    }

    // Limpar carrinho via API
    async function clearCartAPI() {
        try {
            console.log('🧹 Limpando carrinho...');
            
            const response = await authenticatedRequest({
                method: 'delete',
                url: '/Cart/clear'
            });

            const responseData = response.data;
            if (responseData.success) {
                showNotification('Carrinho limpo com sucesso!', 'success');
                displayCartItems([]);
                updateTotalPrice([]);
                updateCartCounter(0);
                return true;
            } else {
                showNotification(responseData.message || 'Erro ao limpar carrinho', 'error');
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao limpar carrinho:', error);
            const message = error.response?.data?.message || 'Erro ao limpar carrinho';
            showNotification(message, 'error');
            return false;
        }
    }

    // Finalizar compra via API
    async function checkoutAPI() {
        try {
            console.log('💳 Finalizando compra...');
            
            const response = await authenticatedRequest({
                method: 'post',
                url: '/Cart/checkout'
            });

            const responseData = response.data;
            if (responseData.success) {
                showNotification('Compra finalizada com sucesso!', 'success');
                displayCartItems([]);
                updateTotalPrice([]);
                updateCartCounter(0);
                closeCart();
                return true;
            } else {
                showNotification(responseData.message || 'Erro ao finalizar compra', 'error');
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao finalizar compra:', error);
            const message = error.response?.data?.message || 'Erro ao finalizar compra';
            showNotification(message, 'error');
            return false;
        }
    }

    // Fallback local
    function loadCartFromLocal() {
        console.log('🔄 Carregando carrinho local...');
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        displayCartItems(cartItems);
        updateTotalPrice(cartItems);
        updateCartCounter(cartItems.length);
    }

    // Atualizar contador do carrinho
    function updateCartCounter(itemCount) {
        const cartCounter = $('.cart-counter, #cart-counter, .cart-count');
        if (cartCounter.length > 0) {
            cartCounter.text(itemCount || 0);
            cartCounter.toggle(itemCount > 0);
        }
        console.log('🔢 Contador do carrinho atualizado:', itemCount);
    }

    function displayCartItems(cartItems, totalValue = null, itemCount = null) {
        const cartContainer = $('#cart-items');
        cartContainer.empty();

        console.log('🎨 Exibindo itens do carrinho:', cartItems);

        if (cartItems.length === 0) {
            cartContainer.html(`
                <div class="cart-empty">
                    <i class="fi fi-rr-shopping-cart"></i>
                    <p>Seu carrinho está vazio</p>
                    <p class="empty-subtitle">Adicione alguns jogos para começar suas compras!</p>
                </div>
            `);
            updateCartCounter(0);
            return;
        }

        cartItems.forEach((item, index) => {
            console.log(`Item ${index + 1}:`, item);
            
            // Verificar se o item tem a estrutura esperada
            if (!item.Game) {
                console.warn('Item sem dados do jogo:', item);
                return;
            }
            
            const cartItem = $(`
                <div class="cart-item" data-cart-id="${item.Id_Cart}">
                    <img src="${item.Game.Image_Url}" alt="${item.Game.Name_Game}" class="cart-img" onerror="this.src='assets/icones/coin.webp'">
                    <div class="cart-item-details">
                        <h4 class="item-price-name">${item.Game.Name_Game}</h4>
                        <p class="item-price">R$ ${item.Game.Price_Game.toFixed(2)}</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-cart-id="${item.Id_Cart}" ${item.Quantity_Cart <= 1 ? 'disabled' : ''}>
                                <i class="fi fi-rr-minus"></i>
                            </button>
                            <span class="quantity-display">${item.Quantity_Cart}</span>
                            <button class="quantity-btn plus" data-cart-id="${item.Id_Cart}">
                                <i class="fi fi-rr-plus"></i>
                            </button>
                        </div>
                        <p class="item-quantity">Subtotal: <span>R$ ${(item.Game.Price_Game * item.Quantity_Cart).toFixed(2)}</span></p>
                    </div>
                    <button class="remove-item" data-cart-id="${item.Id_Cart}">
                        <i class="fi fi-rr-trash"></i>
                        <span>Remover</span>
                    </button>
                </div>
            `);

            cartContainer.append(cartItem);
        });

        // Atualizar contador
        updateCartCounter(itemCount || cartItems.length);

        // Adicionar eventos aos botões de quantidade
        $('.quantity-btn.minus').on('click', function() {
            const cartId = $(this).data('cart-id');
            const quantityElement = $(this).siblings('.quantity-display');
            const currentQuantity = parseInt(quantityElement.text());
            
            if (currentQuantity > 1) {
                updateQuantityAPI(cartId, currentQuantity - 1, $(this));
            }
        });

        $('.quantity-btn.plus').on('click', function() {
            const cartId = $(this).data('cart-id');
            const quantityElement = $(this).siblings('.quantity-display');
            const currentQuantity = parseInt(quantityElement.text());
            
            updateQuantityAPI(cartId, currentQuantity + 1, $(this));
        });

        // Adicionar eventos aos botões de remover
        $('.remove-item').on('click', function() {
            const cartId = $(this).data('cart-id');
            const itemElement = $(this).closest('.cart-item');
            
            // Adicionar animação de remoção
            itemElement.addClass('removing');
            
            setTimeout(() => {
                removeFromCartAPI(cartId);
            }, 300);
        });
    }

    function updateTotalPrice(cartItems, totalValue = null) {
        // Se a API forneceu o valor total, use-o, caso contrário calcule localmente
        let total;
        
        if (totalValue !== null) {
            total = totalValue;
        } else {
            total = cartItems.reduce((sum, item) => {
                // Usar a estrutura da API ou fallback para estrutura local
                const price = item.Game ? item.Game.Price_Game : item.game.price_Game;
                const quantity = item.Quantity_Cart || item.quantity_Cart;
                return sum + (price * quantity);
            }, 0);
        }

        $('#total-price').text(`R$ ${total.toFixed(2)}`);
    }

    // Controles do carrinho
    $('#open-right-sidebar').on('click', function() {
        if (!isAuthenticated()) {
            showNotification('Faça login para acessar o carrinho', 'warning');
            return;
        }
        openCart();
    });

    $('#close-cart').on('click', function() {
        closeCart();
    });

    $('#clear-cart-btn').on('click', function() {
        if (confirm('Tem certeza que deseja limpar o carrinho?')) {
            clearCartAPI();
        }
    });

    $('#checkout-btn').on('click', function() {
        if (confirm('Finalizar compra?')) {
            checkoutAPI();
        }
    });

    function openCart() {
        console.log('🛒 Abrindo carrinho...');
        $('.right-sidebar').addClass('open');
        $('#overlay').addClass('active');
        loadCartFromAPI();
    }

    function closeCart() {
        console.log('❌ Fechando carrinho...');
        $('.right-sidebar').removeClass('open');
        $('#overlay').removeClass('active');
    }

    // Fechar carrinho ao clicar no overlay
    $('#overlay').on('click', function() {
        closeCart();
    });

    // Função para descobrir endpoints do carrinho
    async function discoverCartEndpoints() {
        const endpoints = [
            '/Cart',
            '/Cart/clear',
            '/Cart/checkout',
            '/Cart/items',
            '/Cart/total'
        ];
        
        console.log('🔍 Descobrindo endpoints do carrinho...');
        
        for (const endpoint of endpoints) {
            try {
                console.log(`Testando endpoint: ${endpoint}`);
                const response = await authenticatedRequest({
                    method: 'get',
                    url: endpoint
                });
                console.log(`✅ Endpoint ${endpoint} funciona:`, response.data);
            } catch (error) {
                console.log(`❌ Endpoint ${endpoint} não funciona:`, error.response?.status);
            }
        }
    }

    // Função de teste para verificar conexão com a API
    async function testAPIConnection() {
        try {
            console.log('🧪 Testando conexão com a API...');
            console.log('Base URL:', API_BASE_URL);
            console.log('Token disponível:', !!getAuthToken());
            
            if (!isAuthenticated()) {
                console.log('❌ Usuário não autenticado');
                return false;
            }

            const userData = getUserData();
            console.log('👤 Dados do usuário para teste:', userData);

            if (!userData || !userData.Id_User) {
                console.log('❌ Dados do usuário inválidos para teste');
                return false;
            }

            // Teste simples de conexão
            const response = await authenticatedRequest({
                method: 'get',
                url: '/Cart/' + userData.Id_User
            });

            console.log('✅ Conexão com API funcionando');
            console.log('Resposta:', response.data);
            return true;
        } catch (error) {
            console.log('❌ Erro na conexão com API:', error);
            return false;
        }
    }

    // Função para adicionar botões de compra aos cards dos jogos
    function addBuyButtonsToGames() {
        console.log('🛒 Adicionando botões de compra aos jogos...');
        
        // Adicionar botões de compra aos cards existentes
        $('.game-card').each(function() {
            const card = $(this);
            const gameId = card.data('game-id');
            
            // Verificar se já tem botão de compra
            if (card.find('.buy-game-btn').length === 0) {
                const gameInfo = {
                    id_Game: gameId,
                    name_Game: card.find('h3').text(),
                    price_Game: parseFloat(card.find('.game-price').text().replace('R$ ', '').replace(',', '.'))
                };
                
                // Adicionar botão de compra
                const buyButton = $('<button class="buy-game-btn" title="' + (isAuthenticated() ? 'Adicionar ao carrinho' : 'Faça login para comprar') + '" ' + (!isAuthenticated() ? 'disabled' : '') + '><i class="fi fi-rr-shopping-cart-add"></i>Comprar</button>');
                buyButton.data('game', gameInfo);
                
                // Adicionar ao container de ações
                const actionsContainer = card.find('.game-actions');
                if (actionsContainer.length > 0) {
                    actionsContainer.append(buyButton);
                } else {
                    // Se não existir container de ações, criar um
                    const overlay = card.find('.game-overlay .game-info');
                    if (overlay.length > 0) {
                        overlay.append('<div class="game-actions"></div>');
                        overlay.find('.game-actions').append(buyButton);
                    }
                }
                
                // Adicionar evento de clique
                buyButton.on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (!isAuthenticated()) {
                        showNotification('Faça login para comprar jogos!', 'warning');
                        return;
                    }
                    
                    const gameData = $(this).data('game');
                    window.cartSystem.addToCart(gameData);
                });
            }
        });
    }

    // Função para observar mudanças no DOM e adicionar botões quando novos jogos forem carregados
    function observeGameCards() {
        console.log('👀 Observando mudanças nos cards dos jogos...');
        
        // Observer para detectar quando novos cards são adicionados
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && $(node).hasClass('game-card')) {
                            // Novo card adicionado, adicionar botão de compra
                            setTimeout(() => {
                                addBuyButtonsToGames();
                            }, 100);
                        }
                    });
                }
            });
        });
        
        // Observar mudanças nos containers de jogos
        const gameContainers = ['#favorites', '#action', '.games-container', '.game-grid'];
        gameContainers.forEach(selector => {
            const container = $(selector);
            if (container.length > 0) {
                observer.observe(container[0], {
                    childList: true,
                    subtree: true
                });
                console.log(`Observando container: ${selector}`);
            }
        });
        
        // Adicionar botões aos jogos existentes
        setTimeout(() => {
            addBuyButtonsToGames();
        }, 500);
    }

    // Função para adicionar botão de compra a um jogo específico
    function addBuyButtonToGame(gameData) {
        const gameCard = $(`.game-card[data-game-id="${gameData.id_Game}"]`);
        
        if (gameCard.length > 0) {
            // Verificar se já tem botão de compra
            if (gameCard.find('.buy-game-btn').length === 0) {
                const buyButton = $('<button class="buy-game-btn" title="' + (isAuthenticated() ? 'Adicionar ao carrinho' : 'Faça login para comprar') + '" ' + (!isAuthenticated() ? 'disabled' : '') + '><i class="fi fi-rr-shopping-cart-add"></i>Comprar</button>');
                buyButton.data('game', gameData);
                
                // Adicionar ao container de ações
                const actionsContainer = gameCard.find('.game-actions');
                if (actionsContainer.length > 0) {
                    actionsContainer.append(buyButton);
                } else {
                    // Se não existir container de ações, criar um
                    const overlay = gameCard.find('.game-overlay .game-info');
                    if (overlay.length > 0) {
                        overlay.append('<div class="game-actions"></div>');
                        overlay.find('.game-actions').append(buyButton);
                    }
                }
                
                // Adicionar evento de clique
                buyButton.on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (!isAuthenticated()) {
                        showNotification('Faça login para comprar jogos!', 'warning');
                        return;
                    }
                    
                    const gameData = $(this).data('game');
                    window.cartSystem.addToCart(gameData);
                });
                
                console.log(`✅ Botão de compra adicionado ao jogo: ${gameData.name_Game}`);
            }
        }
    }

    // Função para atualizar estado dos botões de compra baseado na autenticação
    function updateBuyButtonsState() {
        const isLoggedIn = isAuthenticated();
        
        $('.buy-game-btn').each(function() {
            const button = $(this);
            if (isLoggedIn) {
                button.prop('disabled', false);
                button.attr('title', 'Adicionar ao carrinho');
            } else {
                button.prop('disabled', true);
                button.attr('title', 'Faça login para comprar');
            }
        });
    }

    // Listener para detectar mudanças no estado de autenticação
    function setupAuthStateListener() {
        console.log('🔐 Configurando listener de estado de autenticação...');
        
        // Verificar mudanças no localStorage/sessionStorage
        window.addEventListener('storage', function(e) {
            if (e.key === 'authToken' || e.key === 'userData') {
                console.log('🔄 Mudança detectada no estado de autenticação:', e.key);
                setTimeout(() => {
                    updateBuyButtonsState();
                }, 100);
            }
        });
        
        // Observer para mudanças no DOM que podem indicar login/logout
        const authObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            const element = $(node);
                            // Verificar se é um elemento de login/logout
                            if (element.hasClass('login-btn') || element.hasClass('logout-btn') || 
                                element.attr('id') === 'user-name' || element.hasClass('auth-status')) {
                                console.log('🔄 Mudança detectada no DOM de autenticação');
                                setTimeout(() => {
                                    updateBuyButtonsState();
                                }, 100);
                            }
                        }
                    });
                }
            });
        });
        
        // Observar mudanças no body para detectar mudanças de autenticação
        authObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Inicializar carrinho
    async function initializeCart() {
        console.log('🚀 Inicializando sistema do carrinho...');
        
        // Configurar listener de estado de autenticação
        setupAuthStateListener();
        
        // Verificar se está autenticado
        if (!isAuthenticated()) {
            console.log('❌ Usuário não autenticado, carrinho não inicializado');
            // Mesmo sem autenticação, observar cards para adicionar botões desabilitados
            observeGameCards();
            return;
        }
        
        // Testar conexão com a API
        const apiWorking = await testAPIConnection();
        if (apiWorking) {
            console.log('✅ API funcionando, carregando carrinho...');
            await loadCartFromAPI();
        } else {
            console.log('⚠️ API não disponível, usando carrinho local...');
            loadCartFromLocal();
        }
        
        // Observar cards dos jogos e adicionar botões de compra
        observeGameCards();
        
        // Atualizar estado dos botões
        updateBuyButtonsState();
    }

    // Expor funções globalmente
    window.cartSystem = {
        loadCart: loadCartFromAPI,
        addToCart: addToCartAPI,
        removeFromCart: removeFromCartAPI,
        updateQuantity: updateQuantityAPI,
        clearCart: clearCartAPI,
        checkout: checkoutAPI,
        isAuthenticated,
        getAuthToken,
        getUserData,
        showNotification,
        testAPI: testAPIConnection,
        discoverEndpoints: discoverCartEndpoints,
        initializeCart: initializeCart,
        // Novas funções para gerenciar botões de compra
        addBuyButtonsToGames: addBuyButtonsToGames,
        addBuyButtonToGame: addBuyButtonToGame,
        updateBuyButtonsState: updateBuyButtonsState,
        observeGameCards: observeGameCards
    };

    // Inicializar carrinho quando a página carregar
    initializeCart();
});
