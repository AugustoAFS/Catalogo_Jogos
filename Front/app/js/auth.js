"use strict";

$(document).ready(function () {
    const API_BASE_URL = 'https://localhost:7155/api';
    
    // Configurar Axios
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    
    // Verificar status de autenticação ao carregar
    checkAuthStatus();

    // Botão de login
    $('#login-btn').on('click', function() {
        window.location.href = 'login.html';
    });

    // Botão de logout
    $('#logout-btn').on('click', function() {
        logout();
    });

    // Função para verificar status de autenticação
    function checkAuthStatus() {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        
        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                showAuthenticatedUser(user);
            } catch (error) {
                console.error('Erro ao parsear dados do usuário:', error);
                logout();
            }
        } else {
            showUnauthenticatedUser();
        }
    }

    // Função para mostrar usuário autenticado
    function showAuthenticatedUser(user) {
        $('#login-btn').hide();
        $('#logout-btn').show();
        $('#user-name').text(`Olá, ${user.name}`).show();
        
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

    // Animações de entrada
    $('.form-group input').on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        $(this).parent().removeClass('focused');
    });

    // Efeitos de hover nos botões sociais
    $('.social-btn').on('mouseenter', function() {
        $(this).addClass('hover');
    }).on('mouseleave', function() {
        $(this).removeClass('hover');
    });

    // Função para obter dados do usuário
    function getUserData() {
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                // Verificar diferentes possíveis formatos do ID
                const userId = parsed.id || parsed.Id_User || parsed.userId || parsed.Id;
                if (userId) {
                    return {
                        ...parsed,
                        id: userId // Garantir que sempre tenha a propriedade 'id'
                    };
                }
                return parsed;
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    // Expor funções globalmente
    window.auth = {
        isAuthenticated: isAuthenticated,
        getAuthToken: getAuthToken,
        getUserData: getUserData,
        authenticatedRequest: authenticatedRequest,
        logout: logout,
        checkAuthStatus: checkAuthStatus
    };
}); 