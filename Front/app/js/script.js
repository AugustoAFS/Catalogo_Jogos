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
                'Authorization': `Bearer ${token}`
            }
        };

        return axios(authConfig);
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

    // Verificar status de autenticação ao carregar
    async function checkAuthStatus() {
        const token = getAuthToken();
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        
        console.log('🔍 Verificando status de autenticação...');
        console.log('Token:', token ? 'Presente' : 'Ausente');
        console.log('UserData:', userData ? 'Presente' : 'Ausente');
        
        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                console.log('📋 Dados do usuário parseados:', user);
                
                // Verificar se o usuário tem nome
                if (!user.name && user.id) {
                    console.log('⚠️ Usuário sem nome, buscando dados via API...');
                    const updatedUser = await fetchUserData(user.id);
                    if (updatedUser) {
                        showAuthenticatedUser(updatedUser);
                        return;
                    }
                }
                
                showAuthenticatedUser(user);
            } catch (error) {
                console.error('❌ Erro ao parsear dados do usuário:', error);
                logout();
            }
        } else if (token && !userData) {
            // Tem token mas não tem dados do usuário - tentar buscar via API
            console.log('⚠️ Token presente mas sem dados do usuário, buscando via API...');
            try {
                const user = await fetchUserDataFromToken();
                if (user) {
                    showAuthenticatedUser(user);
                    return;
                }
            } catch (error) {
                console.error('❌ Erro ao buscar dados do usuário:', error);
            }
            logout();
        } else {
            showUnauthenticatedUser();
        }
    }

    // Função para buscar dados do usuário via API usando ID
    async function fetchUserData(userId) {
        try {
            const response = await authenticatedRequest({
                method: 'GET',
                url: `/User/${userId}`
            });
            
            if (response.data && response.data.success) {
                const userData = response.data.data;
                // Salvar dados atualizados
                localStorage.setItem('userData', JSON.stringify(userData));
                sessionStorage.setItem('userData', JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            console.error('❌ Erro ao buscar dados do usuário por ID:', error);
        }
        return null;
    }

    // Função para buscar dados do usuário via API usando token
    async function fetchUserDataFromToken() {
        try {
            const response = await authenticatedRequest({
                method: 'GET',
                url: '/Auth/me' // ou '/User/me' dependendo da sua API
            });
            
            if (response.data && response.data.success) {
                const userData = response.data.data;
                // Salvar dados do usuário
                localStorage.setItem('userData', JSON.stringify(userData));
                sessionStorage.setItem('userData', JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            console.error('❌ Erro ao buscar dados do usuário por token:', error);
        }
        return null;
    }

    // Função para mostrar usuário autenticado
    function showAuthenticatedUser(user) {
        console.log('👤 Mostrando usuário autenticado:', user);
        
        $('#login-btn').hide();
        $('#logout-btn').show();
        
        // Verificar diferentes possíveis campos para o nome
        let userName = 'Usuário';
        if (user.name) {
            userName = user.name;
        } else if (user.Name_User) {
            userName = user.Name_User;
        } else if (user.username) {
            userName = user.username;
        } else if (user.email) {
            userName = user.email.split('@')[0]; // Usar parte do email como nome
        }
        
        console.log('📝 Nome do usuário a ser exibido:', userName);
        
        $('#user-name').text(`Olá, ${userName}`).show();
        
        // Habilitar funcionalidades que requerem autenticação
        enableAuthenticatedFeatures();
    }

    // Função para mostrar usuário não autenticado
    function showUnauthenticatedUser() {
        $('#login-btn').show();
        $('#logout-btn').hide();
        $('#user-name').hide();
        
        // Desabilitar funcionalidades que requerem autenticação
        disableAuthenticatedFeatures();
    }

    // Função para logout
    function logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userData');
        
        showUnauthenticatedUser();
        showNotification('Logout realizado com sucesso!', 'success');
    }

    // Função para habilitar funcionalidades autenticadas
    function enableAuthenticatedFeatures() {
        // Habilitar botões de avaliação
        $('.preview-rate-game').prop('disabled', false);
        $('.add-to-cart').prop('disabled', false);
        
        // Adicionar tooltips informativos
        $('.preview-rate-game').attr('title', 'Clique para avaliar este jogo');
        $('.add-to-cart').attr('title', 'Adicionar ao carrinho');
    }

    // Função para desabilitar funcionalidades autenticadas
    function disableAuthenticatedFeatures() {
        // Desabilitar botões de avaliação
        $('.preview-rate-game').prop('disabled', true);
        $('.add-to-cart').prop('disabled', true);
        
        // Adicionar tooltips informativos
        $('.preview-rate-game').attr('title', 'Faça login para avaliar');
        $('.add-to-cart').attr('title', 'Faça login para comprar');
    }

    // Controles de autenticação
    $('#login-btn').on('click', function() {
        window.location.href = 'login.html';
    });

    $('#logout-btn').on('click', function() {
        logout();
    });

    // Controles da sidebar esquerda
    $('#open-left-sidebar').on('click', function() {
        $('.left-sidebar').addClass('active');
        $('#overlay').addClass('active');
        $('body').addClass('sidebar-open');
    });

    $('#close-left-sidebar').on('click', function() {
        $('.left-sidebar').removeClass('active');
        $('#overlay').removeClass('active');
        $('body').removeClass('sidebar-open');
    });

    $('#overlay').on('click', function() {
        $('.left-sidebar').removeClass('active');
        $('.right-sidebar').removeClass('open');
        $('#rating-modal').removeClass('show');
        $('body').removeClass('sidebar-open');
    });

    // Interceptar cliques em funcionalidades que requerem autenticação
    $(document).on('click', '.preview-rate-game, .add-to-cart', function(e) {
        if (!isAuthenticated()) {
            e.preventDefault();
            e.stopPropagation();
            showNotification('Faça login para usar esta funcionalidade!', 'warning');
            return false;
        }
    });

    // Verificar token periodicamente
    setInterval(async () => {
        const token = getAuthToken();
        if (token) {
            try {
                const response = await axios.post('/api/auth/validate-token', {
                    token: token
                });

                if (!response.data.isValid) {
                    logout();
                    showNotification('Sessão expirada. Faça login novamente.', 'warning');
                }
            } catch (error) {
                console.error('Erro ao validar token:', error);
            }
        }
    }, 300000); // Verificar a cada 5 minutos

    // Testar conexão com a API
    async function testAPIConnection() {
        try {
            const response = await axios.get('/Game');
            console.log('✅ Conexão com API estabelecida');
            return true;
        } catch (error) {
            console.log('❌ Erro de conexão com API:', error.message);
            return false;
        }
    }

    // Inicializar sistema
    async function initializeSystem() {
        console.log('🚀 Inicializando Augusto Games...');
        
        // Verificar conexão com API
        const apiConnected = await testAPIConnection();
        if (!apiConnected) {
            showNotification('Servidor offline. Usando dados locais.', 'warning');
        }
        
        // Verificar autenticação (agora é assíncrona)
        await checkAuthStatus();
        
        // Inicializar carrosséis
        if (window.carouselSystem) {
            window.carouselSystem.initializeCarousels();
        }
        
        console.log('✅ Sistema inicializado');
    }

    // Inicializar quando todos os scripts estiverem carregados
    setTimeout(() => {
        initializeSystem();
    }, 100);

    // Expor funções globalmente
    window.mainSystem = {
        isAuthenticated,
        getAuthToken,
        authenticatedRequest,
        showNotification,
        logout,
        checkAuthStatus,
        testAPIConnection
    };

    // Selecionando elementos com jQuery
    const $openLeftSidebarBtn = $("#open-left-sidebar");
    const $openRightSidebarBtn = $("#open-right-sidebar");
    const $closeCartBtn = $("#close-cart");
    const $overlay = $("#overlay");
    const $leftSidebar = $("#left-sidebar");
    const $rightSidebar = $("#right-sidebar");

    // Função para abrir sidebar direita (carrinho)
    function openRightSidebar() {
        $rightSidebar.addClass("open");
        $overlay.addClass("active");
        $("body").addClass("sidebar-open");
    }

    // Função para fechar sidebars
    function closeSidebars() {
        $leftSidebar.removeClass("active");
        $rightSidebar.removeClass("open");
        $overlay.removeClass("active");
        $("body").removeClass("sidebar-open");
    }

    // Abrir sidebar direita (carrinho)
    $openRightSidebarBtn.on("click", function () {
        openRightSidebar();
    });

    // Fechar carrinho
    $closeCartBtn.on("click", closeSidebars);
    
    // Fechar ao clicar no overlay
    $overlay.on("click", closeSidebars);

    // Fechar com tecla ESC
    $(document).on("keydown", function(e) {
        if (e.key === "Escape") {
            closeSidebars();
        }
    });

    // Funcionalidade da sidebar esquerda
    $(".left-sidebar a").on("click", function(e) {
        e.preventDefault();
        const action = $(this).text().toLowerCase();
        
        switch(action) {
            case "lista de desejos":
                showNotification("Funcionalidade de Lista de Desejos em desenvolvimento!");
                break;
            default:
                showNotification("Funcionalidade em desenvolvimento!");
        }
    });

    // Funcionalidade do Augusto Games+
    $(".sidebar-plus-btn, .folder .plane button").on("click", function() {
        showNotification("Augusto Games+ - Assinatura Premium em breve!");
    });

    // Funcionalidade do botão de moedas
    $(".coin button").on("click", function() {
        showNotification("Sistema de moedas em desenvolvimento!");
    });

    // Funcionalidade dos links da navegação
    $(".navbar nav a").on("click", function(e) {
        e.preventDefault();
        const page = $(this).text().toLowerCase();
        
        switch(page) {
            case "home":
                showNotification("Você já está na página inicial!");
                break;
            case "promoção":
                showNotification("Página de promoções em desenvolvimento!");
                break;
            case "ajuda":
                showNotification("Página de ajuda em desenvolvimento!");
                break;
            default:
                showNotification("Página em desenvolvimento!");
        }
    });

    // Adicionar animação de loading
    $(window).on("load", function() {
        $("body").addClass("loaded");
    });
});
