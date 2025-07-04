"use strict";

$(document).ready(function () {
    const API_BASE_URL = 'https://localhost:7155/api';
    
    // Configurar Axios
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    
    // Interceptor para adicionar token automaticamente em todas as requisições
    axios.interceptors.request.use(
        function (config) {
            const token = getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        function (error) {
            return Promise.reject(error);
        }
    );

    // Interceptor para tratar respostas de erro
    axios.interceptors.response.use(
        function (response) {
            return response;
        },
        function (error) {
            if (error.response?.status === 401) {
                console.error('Erro 401: Token inválido ou expirado');
                // Limpar dados de autenticação
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                sessionStorage.removeItem('userData');
                
                // Mostrar notificação e redirecionar
                showNotification('Sessão expirada. Redirecionando para login...', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
            return Promise.reject(error);
        }
    );
    
    // Configurar token automaticamente ao carregar a página
    function setupAuthToken() {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('Token configurado para requisições:', token.substring(0, 20) + '...');
            return true;
        } else {
            console.warn('Nenhum token encontrado. Usuário não autenticado.');
            // Redirecionar para login se necessário
            // window.location.href = 'login.html';
            return false;
        }
    }
    
    // Configurar token imediatamente
    setupAuthToken();
    
    // Função para normalizar dados da API
    function normalizeGameData(games) {
        console.log('Normalizando jogos:', games);
        return games.map(game => ({
            id_Game: game.Id_Game,
            name_Game: game.Name_Game,
            description: game.Description_Game,
            category_Game: game.Category_Game,
            image_Url: game.Image_Url,
            price_Game: game.Price_Game
        }));
    }

    // Carregar jogos da API
    async function loadGamesFromAPI() {
        try {
            // Garantir que o token esteja configurado
            if (!setupAuthToken()) {
                showNotification('Usuário não autenticado. Faça login para continuar.', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            
            console.log('Fazendo requisição para /Game com token...');
            const response = await axios.get('/Game');
            console.log('Resposta da API:', response.data);
            
            // Garantir que games seja sempre um array
            let games = response.data;
            if (!Array.isArray(games)) {
                // Se não for array, pode estar dentro de uma propriedade específica
                if (games && typeof games === 'object') {
                    // Tentar encontrar a propriedade que contém o array
                    const possibleArrayProps = ['data', 'games', 'items', 'results', 'content'];
                    for (const prop of possibleArrayProps) {
                        if (Array.isArray(games[prop])) {
                            games = games[prop];
                            console.log(`Encontrado array em games.${prop}`);
                            break;
                        }
                    }
                }
                
                // Se ainda não for array, usar array vazio
                if (!Array.isArray(games)) {
                    console.error('Não foi possível extrair array de jogos da resposta da API');
                    games = [];
                }
            }
            
            // Normalizar dados da API
            const normalizedGames = normalizeGameData(games);
            console.log('Jogos normalizados:', normalizedGames);
            
            displayGames(normalizedGames);
        } catch (error) {
            console.error('Erro ao carregar jogos da API:', error);
            
            if (error.response?.status === 401) {
                // Token inválido ou expirado
                console.error('Token inválido ou expirado');
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                sessionStorage.removeItem('userData');
                showNotification('Sessão expirada. Redirecionando para login...', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else if (error.response?.status === 403) {
                showNotification('Acesso negado. Você não tem permissão para acessar os jogos.', 'error');
            } else {
                const message = error.response?.data?.message || 'Erro ao carregar jogos da API';
                showNotification(message, 'error');
            }
        }
    }

    // Função para obter token de autenticação
    function getAuthToken() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }

    // Função para verificar se está autenticado
    function isAuthenticated() {
        return !!getAuthToken();
    }

    // Função para fazer requisições autenticadas
    async function authenticatedRequest(config) {
        const token = getAuthToken();
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }

        // Garantir que o token está configurado globalmente
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const authConfig = {
            ...config,
            headers: {
                ...config.headers,
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            return await axios(authConfig);
        } catch (error) {
            if (error.response?.status === 401) {
                // Token inválido, limpar dados e redirecionar
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                sessionStorage.removeItem('userData');
                showNotification('Sessão expirada. Redirecionando para login...', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
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

    function displayGames(games) {
        console.log('displayGames chamada com:', games);
        
        // Verificar se games é um array válido
        if (!Array.isArray(games)) {
            console.error('displayGames recebeu dados inválidos:', games);
            games = [];
        }
        
        console.log('Número de jogos:', games.length);
        
        // Verificar se os containers existem
        const favoritesContainer = $('#favorites');
        const actionContainer = $('#action');
        const rpgContainer = $('#rpg');
        const adventureContainer = $('#adventure');
        const racingContainer = $('#racing');
        const strategyContainer = $('#strategy');
        const indieContainer = $('#indie');
        
        console.log('Container #favorites existe:', favoritesContainer.length > 0);
        console.log('Container #action existe:', actionContainer.length > 0);
        console.log('Container #rpg existe:', rpgContainer.length > 0);
        console.log('Container #adventure existe:', adventureContainer.length > 0);
        console.log('Container #racing existe:', racingContainer.length > 0);
        console.log('Container #strategy existe:', strategyContainer.length > 0);
        console.log('Container #indie existe:', indieContainer.length > 0);
        
        if (favoritesContainer.length === 0) {
            console.error('Container #favorites não encontrado!');
            return;
        }
        
        if (actionContainer.length === 0) {
            console.error('Container #action não encontrado!');
            return;
        }
        
        // Limpar todos os containers
        favoritesContainer.empty();
        actionContainer.empty();
        rpgContainer.empty();
        adventureContainer.empty();
        racingContainer.empty();
        strategyContainer.empty();
        indieContainer.empty();

        // Separar jogos por categoria
        const favorites = games.filter(game => game.category_Game && game.category_Game.toLowerCase() === 'favoritos');
        const action = games.filter(game => game.category_Game && game.category_Game.toLowerCase() === 'ação');
        const rpg = games.filter(game => game.category_Game && game.category_Game.toLowerCase() === 'rpg');
        const adventure = games.filter(game => game.category_Game && game.category_Game.toLowerCase() === 'aventura');
        const racing = games.filter(game => game.category_Game && game.category_Game.toLowerCase() === 'corrida');
        const strategy = games.filter(game => game.category_Game && game.category_Game.toLowerCase() === 'estratégia');
        const indie = games.filter(game => game.category_Game && game.category_Game.toLowerCase() === 'indie');

        console.log('Jogos por categoria:', {
            favorites: favorites.length,
            action: action.length,
            rpg: rpg.length,
            adventure: adventure.length,
            racing: racing.length,
            strategy: strategy.length,
            indie: indie.length
        });

        // Se não há favoritos, usar os primeiros jogos como favoritos
        let gamesToShowInFavorites = favorites;
        if (favorites.length === 0 && games.length > 0) {
            // Pegar os primeiros 4 jogos para a seção de favoritos
            gamesToShowInFavorites = games.slice(0, 4);
            console.log('Usando primeiros jogos como favoritos:', gamesToShowInFavorites.length);
        }

        // Adicionar jogos às categorias
        gamesToShowInFavorites.forEach(game => createGameCard(game, '#favorites'));
        
        // Para as outras seções, mostrar apenas jogos que não estão nos favoritos
        const actionGames = action.filter(game => 
            !gamesToShowInFavorites.some(favGame => favGame.id_Game === game.id_Game)
        );
        const rpgGames = rpg.filter(game => 
            !gamesToShowInFavorites.some(favGame => favGame.id_Game === game.id_Game)
        );
        const adventureGames = adventure.filter(game => 
            !gamesToShowInFavorites.some(favGame => favGame.id_Game === game.id_Game)
        );
        const racingGames = racing.filter(game => 
            !gamesToShowInFavorites.some(favGame => favGame.id_Game === game.id_Game)
        );
        const strategyGames = strategy.filter(game => 
            !gamesToShowInFavorites.some(favGame => favGame.id_Game === game.id_Game)
        );
        const indieGames = indie.filter(game => 
            !gamesToShowInFavorites.some(favGame => favGame.id_Game === game.id_Game)
        );
        
        actionGames.forEach(game => createGameCard(game, '#action'));
        rpgGames.forEach(game => createGameCard(game, '#rpg'));
        adventureGames.forEach(game => createGameCard(game, '#adventure'));
        racingGames.forEach(game => createGameCard(game, '#racing'));
        strategyGames.forEach(game => createGameCard(game, '#strategy'));
        indieGames.forEach(game => createGameCard(game, '#indie'));

        console.log('Distribuição final dos jogos:', {
            favoritos: gamesToShowInFavorites.length,
            acao: actionGames.length,
            rpg: rpgGames.length,
            aventura: adventureGames.length,
            corrida: racingGames.length,
            estrategia: strategyGames.length,
            indie: indieGames.length,
            total: gamesToShowInFavorites.length + actionGames.length + rpgGames.length + 
                   adventureGames.length + racingGames.length + strategyGames.length + indieGames.length
        });

        console.log('Total de cards criados:', $('.game-card').length);
        console.log('Cards na seção favoritos:', $('#favorites .game-card').length);
        console.log('Cards na seção ação:', $('#action .game-card').length);
        console.log('Cards na seção RPG:', $('#rpg .game-card').length);
        console.log('Cards na seção aventura:', $('#adventure .game-card').length);
        console.log('Cards na seção corrida:', $('#racing .game-card').length);
        console.log('Cards na seção estratégia:', $('#strategy .game-card').length);
        console.log('Cards na seção indie:', $('#indie .game-card').length);

        // Inicializar carrosséis
        initializeCarousels();
    }

    function createGameCard(game, container) {
        console.log('Criando card para jogo:', game);
        console.log('Container:', container);
        
        // Criar card simples que funciona com o CSS existente
        const card = $(`
            <article class="game-card" data-game-id="${game.id_Game}">
                <img src="${game.image_Url}" alt="${game.name_Game}" loading="lazy">
                <div class="game-overlay">
                    <div class="game-info">
                        <h3>${game.name_Game}</h3>
                        <p class="game-description">${game.description || 'Descrição não disponível'}</p>
                        <div class="game-price">R$ ${game.price_Game.toFixed(2)}</div>
                        <div class="game-actions">
                            <button class="preview-rate-game" title="${isAuthenticated() ? 'Avaliar jogo' : 'Faça login para avaliar'}" ${!isAuthenticated() ? 'disabled' : ''}>
                                <i class="fi fi-rr-star"></i>
                                Avaliar
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `);

        $(container).append(card);
        console.log('Card adicionado ao container:', container);

        // Adicionar eventos aos botões
        card.find('.preview-rate-game').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!isAuthenticated()) {
                showNotification('Faça login para avaliar jogos!', 'warning');
                return;
            }
            openRatingModal(game);
        });
    }

    async function openRatingModal(game) {
        console.log('Tentando abrir modal de avaliação para:', game);
        
        // Aguardar um pouco para garantir que o sistema de avaliações esteja carregado
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!window.ratingSystem || !window.ratingSystem.openRatingModal) {
            if (attempts >= maxAttempts) {
                console.error('Sistema de avaliações não encontrado após', maxAttempts, 'tentativas');
                showNotification('Erro ao abrir sistema de avaliações', 'error');
                return;
            }
            
            console.log('Aguardando sistema de avaliações... Tentativa', attempts + 1);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        try {
            // Verificar se já existe avaliação
            const response = await authenticatedRequest({
                method: 'get',
                url: `/Rating/game/${game.id_Game}`
            });

            let existingRating = null;
            if (response.data && response.data.data) {
                const ratings = response.data.data;
                const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
                const userId = userData.id || userData.Id_User || userData.userId || userData.Id;
                
                console.log('=== DEBUG AVALIAÇÃO EXISTENTE ===');
                console.log('UserData:', userData);
                console.log('UserId encontrado:', userId);
                console.log('Todas as avaliações:', ratings);
                
                if (userId) {
                    // Tentar diferentes formatos de comparação
                    existingRating = ratings.find(r => {
                        console.log('Comparando:', r.Id_User, 'com', userId, 'tipo:', typeof r.Id_User, typeof userId);
                        return r.Id_User == userId || r.Id_User === parseInt(userId) || r.Id_User === userId.toString();
                    });
                    
                    if (existingRating) {
                        console.log('Avaliação existente encontrada:', existingRating);
                    } else {
                        console.log('Nenhuma avaliação existente encontrada para este usuário');
                    }
                }
            }

            // Abrir modal de avaliação
            console.log('Abrindo modal com sistema de avaliações');
            window.ratingSystem.openRatingModal(game, existingRating);
        } catch (error) {
            console.error('Erro ao verificar avaliações:', error);
            // Tentar abrir modal mesmo sem verificar avaliações existentes
            if (window.ratingSystem && window.ratingSystem.openRatingModal) {
                window.ratingSystem.openRatingModal(game);
            } else {
                showNotification('Erro ao abrir sistema de avaliações', 'error');
            }
        }
    }

    function initializeCarousels() {
        console.log('Card-Games: Inicializando carrosséis...');
        
        // Aguardar um pouco para garantir que os jogos foram renderizados
        setTimeout(() => {
            if (typeof window.initializeCarousels === 'function') {
                console.log('Card-Games: Chamando window.initializeCarousels()');
                window.initializeCarousels();
            } else {
                console.warn('Card-Games: Função window.initializeCarousels não encontrada no escopo global');
                
                // Tentar inicializar manualmente se a função global não estiver disponível
                console.log('Card-Games: Tentando inicialização manual dos carrosséis');
                try {
                    // Verificar se o jQuery está disponível
                    if (typeof $ !== 'undefined') {
                        // Contar jogos em cada categoria
                        const categories = ['favorites', 'action', 'rpg', 'adventure', 'racing', 'strategy', 'indie'];
                        categories.forEach(category => {
                            const cards = $(`#${category} .game-card`);
                            console.log(`Categoria ${category}: ${cards.length} jogos`);
                        });
                    }
                } catch (error) {
                    console.error('Card-Games: Erro na inicialização manual:', error);
                }
            }
        }, 1000); // Aguardar 1 segundo para garantir que os jogos foram renderizados
    }

    // Busca em tempo real
    $('#search-input').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        
        $('.game-card').each(function() {
            const gameName = $(this).find('h3').text().toLowerCase();
            const gameCategory = $(this).find('.game-category').text().toLowerCase();
            
            if (gameName.includes(searchTerm) || gameCategory.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    // Limpar busca
    $('#clear-search').on('click', function() {
        $('#search-input').val('');
        $('.game-card').show();
    });

    // Buscar
    $('#search-btn').on('click', function() {
        $('#search-input').trigger('input');
    });

    // Busca com Enter
    $('#search-input').on('keypress', function(e) {
        if (e.which === 13) {
            $('#search-btn').click();
        }
    });

    // Inicializar
    setTimeout(() => {
        console.log('Iniciando carregamento de jogos...');
        loadGamesFromAPI();
    }, 100);

    // Expor funções globalmente
    window.gameSystem = {
        loadGamesFromAPI,
        isAuthenticated,
        getAuthToken,
        authenticatedRequest,
        showNotification
    };
});
