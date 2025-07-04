"use strict";

$(document).ready(function () {
    // Configurações do carrossel
    const carouselConfig = {
        favorites: {
            container: '#favorites-wrapper',
            prevBtn: '#prev-favorites',
            nextBtn: '#next-favorites',
            currentPosition: 0
        },
        action: {
            container: '#action-wrapper',
            prevBtn: '#prev-action',
            nextBtn: '#next-action',
            currentPosition: 0
        },
        rpg: {
            container: '#rpg-wrapper',
            prevBtn: '#prev-rpg',
            nextBtn: '#next-rpg',
            currentPosition: 0
        },
        adventure: {
            container: '#adventure-wrapper',
            prevBtn: '#prev-adventure',
            nextBtn: '#next-adventure',
            currentPosition: 0
        },
        racing: {
            container: '#racing-wrapper',
            prevBtn: '#prev-racing',
            nextBtn: '#next-racing',
            currentPosition: 0
        },
        strategy: {
            container: '#strategy-wrapper',
            prevBtn: '#prev-strategy',
            nextBtn: '#next-strategy',
            currentPosition: 0
        },
        indie: {
            container: '#indie-wrapper',
            prevBtn: '#prev-indie',
            nextBtn: '#next-indie',
            currentPosition: 0
        }
    };

    // Função para calcular quantos cards cabem na tela
    function getCardsPerView() {
        const screenWidth = window.innerWidth;
        const cardWidth = 220; // 200px do card + 20px de gap
        const containerPadding = 80; // Padding do container (40px de cada lado)
        const availableWidth = screenWidth - containerPadding;
        return Math.floor(availableWidth / cardWidth);
    }

    // Função para contar jogos em uma categoria específica
    function getTotalCards(carouselType) {
        const categoryId = carouselType; // favorites, action, rpg, etc.
        const cards = $(`#${categoryId} .game-card`);
        return cards.length;
    }

    // Função para navegar no carrossel
    function navigateCarousel(carouselType, direction) {
        const config = carouselConfig[carouselType];
        const container = $(config.container);
        const cardWidth = 220; // 200px do card + 20px de gap
        const cardsPerView = getCardsPerView();
        const totalCards = getTotalCards(carouselType);
        
        console.log(`Navegando carrossel ${carouselType}:`, {
            totalCards,
            cardsPerView,
            currentPosition: config.currentPosition
        });
        
        const maxPosition = Math.max(0, totalCards - cardsPerView + 1); // Permite que o último card fique parcialmente visível

        if (direction === 'next') {
            config.currentPosition = Math.min(config.currentPosition + cardsPerView, maxPosition);
        } else {
            config.currentPosition = Math.max(config.currentPosition - cardsPerView, 0);
        }

        const translateX = -config.currentPosition * cardWidth;
        container.css('transform', `translateX(${translateX}px)`);

        // Atualizar estado dos botões
        updateCarouselButtons(carouselType);
    }

    // Função para atualizar estado dos botões
    function updateCarouselButtons(carouselType) {
        const config = carouselConfig[carouselType];
        const cardsPerView = getCardsPerView();
        const totalCards = getTotalCards(carouselType);
        const maxPosition = Math.max(0, totalCards - cardsPerView + 1); // Permite que o último card fique parcialmente visível

        console.log(`Atualizando botões ${carouselType}:`, {
            totalCards,
            cardsPerView,
            currentPosition: config.currentPosition,
            maxPosition
        });

        // Botão anterior
        if (config.currentPosition <= 0) {
            $(config.prevBtn).prop('disabled', true);
        } else {
            $(config.prevBtn).prop('disabled', false);
        }

        // Botão próximo
        if (config.currentPosition >= maxPosition) {
            $(config.nextBtn).prop('disabled', true);
        } else {
            $(config.nextBtn).prop('disabled', false);
        }
    }

    // Event listeners para os botões
    $('#prev-favorites').on('click', function() {
        navigateCarousel('favorites', 'prev');
    });

    $('#next-favorites').on('click', function() {
        navigateCarousel('favorites', 'next');
    });

    $('#prev-action').on('click', function() {
        navigateCarousel('action', 'prev');
    });

    $('#next-action').on('click', function() {
        navigateCarousel('action', 'next');
    });

    $('#prev-rpg').on('click', function() {
        navigateCarousel('rpg', 'prev');
    });

    $('#next-rpg').on('click', function() {
        navigateCarousel('rpg', 'next');
    });

    $('#prev-adventure').on('click', function() {
        navigateCarousel('adventure', 'prev');
    });

    $('#next-adventure').on('click', function() {
        navigateCarousel('adventure', 'next');
    });

    $('#prev-racing').on('click', function() {
        navigateCarousel('racing', 'prev');
    });

    $('#next-racing').on('click', function() {
        navigateCarousel('racing', 'next');
    });

    $('#prev-strategy').on('click', function() {
        navigateCarousel('strategy', 'prev');
    });

    $('#next-strategy').on('click', function() {
        navigateCarousel('strategy', 'next');
    });

    $('#prev-indie').on('click', function() {
        navigateCarousel('indie', 'prev');
    });

    $('#next-indie').on('click', function() {
        navigateCarousel('indie', 'next');
    });

    // Navegação com teclado
    $(document).on('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            // Navegar para esquerda na seção ativa
            const activeSection = $('.games-container:hover').length > 0 ? 
                $('.games-container:hover').find('.carousel-btn').first().attr('id').replace('prev-', '') : 'favorites';
            navigateCarousel(activeSection, 'prev');
        } else if (e.key === 'ArrowRight') {
            // Navegar para direita na seção ativa
            const activeSection = $('.games-container:hover').length > 0 ? 
                $('.games-container:hover').find('.carousel-btn').first().attr('id').replace('prev-', '') : 'favorites';
            navigateCarousel(activeSection, 'next');
        }
    });

    // Inicializar carrosséis
    function initializeCarousels() {
        console.log('Inicializando carrosséis...');
        
        // Aguardar um pouco para garantir que os jogos foram carregados
        setTimeout(() => {
            updateCarouselButtons('favorites');
            updateCarouselButtons('action');
            updateCarouselButtons('rpg');
            updateCarouselButtons('adventure');
            updateCarouselButtons('racing');
            updateCarouselButtons('strategy');
            updateCarouselButtons('indie');
            
            console.log('Carrosséis inicializados');
        }, 500);
    }

    // Atualizar quando a janela for redimensionada
    $(window).on('resize', function() {
        // Resetar posições
        carouselConfig.favorites.currentPosition = 0;
        carouselConfig.action.currentPosition = 0;
        carouselConfig.rpg.currentPosition = 0;
        carouselConfig.adventure.currentPosition = 0;
        carouselConfig.racing.currentPosition = 0;
        carouselConfig.strategy.currentPosition = 0;
        carouselConfig.indie.currentPosition = 0;
        
        // Resetar transformações
        $('#favorites-wrapper').css('transform', 'translateX(0px)');
        $('#action-wrapper').css('transform', 'translateX(0px)');
        $('#rpg-wrapper').css('transform', 'translateX(0px)');
        $('#adventure-wrapper').css('transform', 'translateX(0px)');
        $('#racing-wrapper').css('transform', 'translateX(0px)');
        $('#strategy-wrapper').css('transform', 'translateX(0px)');
        $('#indie-wrapper').css('transform', 'translateX(0px)');
        
        // Atualizar botões
        initializeCarousels();
    });

    // Inicializar quando a página carregar
    initializeCarousels();

    // Mostrar botões sempre visíveis
    $('.carousel-btn').show();
    
    // Expor função globalmente
    window.initializeCarousels = initializeCarousels;
}); 