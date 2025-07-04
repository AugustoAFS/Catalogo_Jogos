"use strict";

$(document).ready(function () {
    const API_BASE_URL = 'https://localhost:7155/api';
    
    // Configurar Axios
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    
    // Controle de abas
    $('.tab-btn').on('click', function() {
        const tab = $(this).data('tab');
        
        // Atualizar botões
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        // Atualizar formulários
        $('.auth-form').removeClass('active');
        $(`#${tab}-form`).addClass('active');
    });

    // Toggle de visibilidade da senha
    $('.toggle-password').on('click', function() {
        const input = $(this).siblings('input');
        const icon = $(this).find('i');
        
        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('fi-rr-eye').addClass('fi-rr-eye-crossed');
        } else {
            input.attr('type', 'password');
            icon.removeClass('fi-rr-eye-crossed').addClass('fi-rr-eye');
        }
    });

    // Validação de senha
    function validatePassword(password) {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        
        const errors = [];
        
        if (password.length < minLength) {
            errors.push(`Senha deve ter pelo menos ${minLength} caracteres`);
        }
        if (!hasUpperCase) {
            errors.push('Senha deve conter pelo menos uma letra maiúscula');
        }
        if (!hasLowerCase) {
            errors.push('Senha deve conter pelo menos uma letra minúscula');
        }
        if (!hasNumbers) {
            errors.push('Senha deve conter pelo menos um número');
        }
        
        return errors;
    }

    // Validação de email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Login - CONFIGURADO PARA SUA API
    $('#login-form').on('submit', async function(e) {
        e.preventDefault();
        
        const email = $('#login-email').val().trim();
        const password = $('#login-password').val();
        const rememberMe = $('#remember-me').is(':checked');
        
        // Validações
        if (!email || !password) {
            showNotification('Preencha todos os campos', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Email inválido', 'error');
            return;
        }
        
        // Desabilitar botão
        const submitBtn = $(this).find('.submit-btn');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<i class="fi fi-rr-spinner"></i> Entrando...');
        
        try {
            console.log('Enviando dados de login:', { Email_User: email, Password_User: '***' });
            console.log('URL:', API_BASE_URL + '/Auth/login');
            
            // CONFIGURAÇÃO CORRETA PARA SUA API - DADOS NO BODY
            const response = await axios.post('/Auth/login', {
                Email_User: email,
                Password_User: password
            });
            
            console.log('Resposta da API:', response);
            const responseData = response.data;
            
            if (responseData.success && responseData.data) {
                const token = responseData.data.Token;
                const userData = responseData.data.User;
                
                // Salvar token e dados do usuário
                if (rememberMe) {
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userData', JSON.stringify(userData));
                } else {
                    sessionStorage.setItem('authToken', token);
                    sessionStorage.setItem('userData', JSON.stringify(userData));
                }
                
                // Configurar token para próximas requisições
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                console.log('Token salvo:', token);
                console.log('Dados do usuário salvos:', userData);
                
                showNotification(responseData.message || 'Login realizado com sucesso!', 'success');
            } else {
                showNotification('Erro na resposta da API', 'error');
                return;
            }
            
            // Redirecionar para a página principal
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            console.error('Erro detalhado:', error);
            console.error('Status:', error.response?.status);
            console.error('Dados da resposta:', error.response?.data);
            console.error('Headers da resposta:', error.response?.headers);
            
            let message = 'Erro no login';
            
            if (error.response?.status === 400) {
                // Erro 400 - Bad Request
                if (error.response.data?.message) {
                    message = error.response.data.message;
                } else if (error.response.data?.errors) {
                    // Se há erros de validação
                    const errors = error.response.data.errors;
                    if (typeof errors === 'object') {
                        const firstError = Object.values(errors)[0];
                        message = Array.isArray(firstError) ? firstError[0] : firstError;
                    } else {
                        message = errors;
                    }
                } else {
                    message = 'Dados inválidos. Verifique email e senha.';
                }
            } else if (error.response?.status === 401) {
                message = 'Email ou senha incorretos';
            } else if (error.response?.status === 404) {
                message = 'Usuário não encontrado';
            } else if (error.response?.status === 500) {
                message = 'Erro interno do servidor. Tente novamente mais tarde.';
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
                message = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
            } else {
                message = error.response?.data?.message || error.message || 'Erro no login';
            }
            
            showNotification(message, 'error');
        } finally {
            submitBtn.prop('disabled', false).html(originalText);
        }
    });

    // Cadastro (mantendo estrutura original, mas você pode adaptar se necessário)
    $('#register-form').on('submit', async function(e) {
        e.preventDefault();
        
        const name = $('#register-name').val().trim();
        const email = $('#register-email').val().trim();
        const password = $('#register-password').val();
        const confirmPassword = $('#register-confirm-password').val();
        const acceptTerms = $('#terms-accept').is(':checked');
        
        // Validações
        if (!name || !email || !password || !confirmPassword) {
            showNotification('Preencha todos os campos', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Email inválido', 'error');
            return;
        }
        
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            showNotification(passwordErrors[0], 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('As senhas não coincidem', 'error');
            return;
        }
        
        if (!acceptTerms) {
            showNotification('Você deve aceitar os termos de uso', 'error');
            return;
        }
        
        // Desabilitar botão
        const submitBtn = $(this).find('.submit-btn');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<i class="fi fi-rr-spinner"></i> Cadastrando...');
        
        try {
            console.log('Enviando dados de cadastro:', { name, email, password: '***' });
            
            // Se sua API de cadastro também usa headers, descomente e ajuste:
            /*
            const response = await axios.post('/Auth/register', {}, {
                headers: {
                    'Name_User': name,
                    'Email_User': email,
                    'Password_User': password,
                    'Content-Type': 'application/json'
                }
            });
            */
            
            // Usando body tradicional para cadastro (ajuste conforme sua API)
            const response = await axios.post('/auth/register', {
                name: name,
                email: email,
                password: password
            });
            
            console.log('Resposta da API:', response);
            const data = response.data;
            showNotification('Cadastro realizado com sucesso! Faça login para continuar.', 'success');
            
            // Limpar formulário e voltar para login
            setTimeout(() => {
                $('#register-form')[0].reset();
                $('.tab-btn[data-tab="login"]').click();
            }, 2000);
            
        } catch (error) {
            console.error('Erro detalhado:', error);
            console.error('Status:', error.response?.status);
            console.error('Dados da resposta:', error.response?.data);
            
            let message = 'Erro no cadastro';
            
            if (error.response?.status === 400) {
                // Erro 400 - Bad Request
                if (error.response.data?.message) {
                    message = error.response.data.message;
                } else if (error.response.data?.errors) {
                    // Se há erros de validação
                    const errors = error.response.data.errors;
                    if (typeof errors === 'object') {
                        const firstError = Object.values(errors)[0];
                        message = Array.isArray(firstError) ? firstError[0] : firstError;
                    } else {
                        message = errors;
                    }
                } else {
                    message = 'Dados inválidos. Verifique as informações fornecidas.';
                }
            } else if (error.response?.status === 409) {
                message = 'Email já está em uso. Tente fazer login ou use outro email.';
            } else if (error.response?.status === 500) {
                message = 'Erro interno do servidor. Tente novamente mais tarde.';
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
                message = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
            } else {
                message = error.response?.data?.message || error.message || 'Erro no cadastro';
            }
            
            showNotification(message, 'error');
        } finally {
            submitBtn.prop('disabled', false).html(originalText);
        }
    });

    // Login social (simulado)
    $('.social-btn').on('click', function(e) {
        e.preventDefault();
        const provider = $(this).hasClass('google') ? 'Google' : 'Facebook';
        showNotification(`Login com ${provider} em desenvolvimento!`, 'info');
    });

    // Esqueceu a senha
    $('.forgot-password').on('click', function(e) {
        e.preventDefault();
        showNotification('Funcionalidade de recuperação de senha em desenvolvimento!', 'info');
    });

    // Termos de uso
    $('.terms-link').on('click', function(e) {
        e.preventDefault();
        showNotification('Termos de uso em desenvolvimento!', 'info');
    });

    // Função para mostrar notificações
    function showNotification(message, type = 'info') {
        $('.notification').remove();
        
        const notification = $(`
            <div class="notification ${type}">
                <span>${message}</span>
            </div>
        `);
        
        $('#notifications').append(notification);
        
        setTimeout(() => {
            notification.addClass('show');
        }, 100);
        
        setTimeout(() => {
            notification.removeClass('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    // Funções utilitárias para gerenciamento de token
    window.AuthUtils = {
        // Obter token salvo
        getToken: function() {
            return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        },
        
        // Obter dados do usuário
        getUserData: function() {
            const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        },
        
        // Configurar token para requisições Axios
        setupAxiosToken: function() {
            const token = this.getToken();
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                return true;
            }
            return false;
        },
        
        // Fazer logout
        logout: function() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userData');
            delete axios.defaults.headers.common['Authorization'];
            window.location.href = 'login.html';
        },
        
        // Verificar se está logado
        isLoggedIn: function() {
            return !!this.getToken();
        }
    };

    // Verificar se já está logado
    function checkAuthStatus() {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
            // Configurar token para todas as requisições
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            console.log('Usuário já está logado. Token configurado para requisições.');
            showNotification('Você já está logado!', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }

    // Verificar status de autenticação ao carregar
    checkAuthStatus();

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

    // Função de teste para verificar a API (descomente para testar)
    /*
    async function testAPI() {
        try {
            console.log('Testando conexão com a API...');
            const response = await axios.get('/Auth/login');
            console.log('API respondeu:', response.status);
        } catch (error) {
            console.log('Teste da API:', error.response?.status || 'Erro de conexão');
        }
    }
    // testAPI();
    */
});
