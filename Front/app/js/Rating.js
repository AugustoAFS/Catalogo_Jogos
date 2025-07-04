"use strict";

class RatingSystem {
    constructor() {
        this.API_BASE_URL = "https://localhost:7155/api";
        this.currentGameData = null;
        this.currentRatingData = null;
        this.isModalOpen = false;
        
        this.init();
    }

    init() {
        this.configureAxios();
        this.setupEventListeners();
        this.exposeGlobalAPI();
    }

    configureAxios() {
        axios.defaults.baseURL = this.API_BASE_URL;
        axios.defaults.headers.common["Content-Type"] = "application/json";
        
        this.setupAxiosInterceptors();
    }

    setupAxiosInterceptors() {
        axios.interceptors.request.use(
            (config) => {
                const token = this.getAuthToken();
                if (token) {
                    config.headers.Authorization = token.startsWith("Bearer ") 
                        ? token 
                        : `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    this.showNotification("Sessão expirada. Faça login novamente.", "warning");
                }
                return Promise.reject(error);
            }
        );
    }

    setupEventListeners() {
        document.addEventListener("click", (e) => {
            if (e.target && e.target.id === "overlay") {
                this.closeRatingModal();
            }
        });
    }

    exposeGlobalAPI() {
        window.ratingSystem = {
            openRatingModal: (game, existingRating) => this.openRatingModal(game, existingRating),
            loadRatings: (gameId) => this.loadRatingsFromAPI(gameId),
            submitRating: (gameId, rating, comment) => this.submitRatingAPI(gameId, rating, comment),
            updateRating: (ratingId, rating, comment) => this.updateRatingAPI(ratingId, rating, comment),
            deleteRating: (ratingId) => this.deleteRatingAPI(ratingId),
            isAuthenticated: () => this.isAuthenticated(),
            getAuthToken: () => this.getAuthToken(),
            showNotification: (message, type) => this.showNotification(message, type)
        };
    }

    getAuthToken() {
        return window.auth 
            ? window.auth.getAuthToken() 
            : (localStorage.getItem("authToken") || sessionStorage.getItem("authToken"));
    }

    isAuthenticated() {
        return window.auth 
            ? window.auth.isAuthenticated() 
            : !!(this.getAuthToken() && this.getUserData());
    }

    async authenticatedRequest(config) {
        if (window.auth) {
            return window.auth.authenticatedRequest(config);
        }
        
        const token = this.getAuthToken();
        if (!token) {
            throw new Error("Token não encontrado");
        }

        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        
        return axios(config);
    }

    getUserData() {
        if (window.auth?.getUserData) {
            return window.auth.getUserData();
        }
        
        const userData = localStorage.getItem("userData") || sessionStorage.getItem("userData");
        if (!userData) return null;
        
        try {
            const parsed = JSON.parse(userData);
            const userId = parsed.id || parsed.Id_User || parsed.userId || parsed.Id;
            
            return userId ? { ...parsed, id: userId } : parsed;
        } catch (error) {
            console.error("Erro ao processar dados do usuário:", error);
            return null;
        }
    }

    showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.innerHTML = message;

        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add("show"), 100);
        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async loadRatingsFromAPI(gameId) {
        try {
            const response = await this.authenticatedRequest({
                method: "GET",
                url: `/Rating/game/${gameId}`
            });
            
            const ratings = response.data?.data || [];
            await this.loadUserDataForRatings(ratings);
            
            return ratings;
        } catch (error) {
            console.error("Erro ao carregar avaliações:", error);
            this.showNotification("Erro ao carregar avaliações", "error");
            return [];
        }
    }

    async submitRatingAPI(gameId, rating, comment = "") {
        try {
            if (!this.validateAuthentication()) return false;

            const userData = this.getUserData();
            if (!userData) {
                this.showNotification("Erro: Dados do usuário não encontrados. Faça login novamente.", "error");
                return false;
            }

            const requestData = {
                Id_Game: gameId,
                Id_User: userData.id,
                Rating_Value: rating,
                Comment: comment
            };

            await this.authenticatedRequest({
                method: "POST",
                url: "/Rating",
                data: requestData
            });

            this.showNotification("Avaliação enviada com sucesso!", "success");
            return true;
        } catch (error) {
            console.error("Erro ao enviar avaliação:", error);
            const message = error.response?.data?.message || "Erro ao enviar avaliação";
            this.showNotification(message, "error");
            return false;
        }
    }

    async updateRatingAPI(ratingId, rating, comment = "") {
        try {
            if (!this.validateAuthentication()) return false;

            const requestData = {
                Rating_Value: rating,
                Comment: comment
            };

            await this.authenticatedRequest({
                method: "PUT",
                url: `/Rating/${ratingId}`,
                data: requestData
            });

            this.showNotification("Avaliação atualizada com sucesso!", "success");
            
            if (this.currentGameData?.id_Game) {
                await this.loadExistingRatings(this.currentGameData.id_Game);
            }
            
            return true;
        } catch (error) {
            console.error("Erro ao atualizar avaliação:", error);
            const message = error.response?.data?.message || "Erro ao atualizar avaliação";
            this.showNotification(message, "error");
            return false;
        }
    }

    async deleteRatingAPI(ratingId) {
        try {
            await this.authenticatedRequest({
                method: "DELETE",
                url: `/Rating/${ratingId}`
            });

            this.showNotification("Avaliação removida com sucesso!", "success");
            return true;
        } catch (error) {
            console.error("Erro ao remover avaliação:", error);
            const message = error.response?.data?.message || "Erro ao remover avaliação";
            this.showNotification(message, "error");
            return false;
        }
    }

    async getUserById(userId) {
        try {
            const response = await this.authenticatedRequest({
                method: "GET",
                url: `/User/${userId}`
            });
            
            return response.data?.data || response.data;
        } catch (error) {
            if (error.response?.status === 403) {
                console.warn(`Sem permissão para buscar dados do usuário ${userId}. Usando dados limitados.`);
                return null;
            }
            
            console.error(`Erro ao buscar usuário ${userId}:`, error);
            return null;
        }
    }

    validateAuthentication() {
        if (!this.isAuthenticated()) {
            this.showNotification("Faça login para avaliar jogos", "warning");
            return false;
        }
        return true;
    }

    validateRatingData(rating) {
        if (!rating || rating < 1 || rating > 5) {
            this.showNotification("Selecione uma avaliação válida (1-5 estrelas)", "error");
            return false;
        }
        return true;
    }

    updateRatingFeedback(rating) {
        const feedbackMap = {
            0: { text: "Selecione uma avaliação", class: "text-muted" },
            1: { text: " Péssimo (1/5)", class: "text-danger" },
            2: { text: " Ruim (2/5)", class: "text-warning" },
            3: { text: " Regular (3/5)", class: "text-info" },
            4: { text: " Bom (4/5)", class: "text-success" },
            5: { text: " Excelente! (5/5)", class: "text-primary" }
        };

        const feedback = feedbackMap[rating] || feedbackMap[0];
        
        let feedbackElement = document.querySelector(".rating-feedback");
        if (!feedbackElement) {
            feedbackElement = document.createElement("div");
            feedbackElement.className = "rating-feedback";
            feedbackElement.style.cssText = "text-align: center; margin-top: 10px; font-weight: bold;";
            
            const starRating = document.querySelector(".star-rating");
            if (starRating) {
                starRating.insertAdjacentElement("afterend", feedbackElement);
            }
        }
        
        feedbackElement.textContent = feedback.text;
        feedbackElement.className = `rating-feedback ${feedback.class}`;
    }

    updateStarDisplay(rating) {
        this.saveStarSelection(rating);
    }

    saveStarSelection(rating) {
        rating = parseInt(rating) || 0;
        
        const stars = document.querySelectorAll(".star-rating .star");
        stars.forEach((star, index) => {
            star.classList.remove("active");
            if (index < rating) {
                star.classList.add("active");
            }
        });
        
        this.updateRatingFeedback(rating);
        
        if (rating > 0) {
            this.showNotification(`Avaliação selecionada: ${rating} estrela${rating > 1 ? "s" : ""}`, "success");
        }
    }

    showStarPreview(rating) {
        const stars = document.querySelectorAll(".star-rating .star");
        stars.forEach((star, index) => {
            star.classList.remove("active");
            if (index < rating) {
                star.classList.add("active");
            }
        });
    }

    findClosest(element, selector) {
        if (element.closest) {
            return element.closest(selector);
        }
        
        let current = element;
        while (current && current !== document) {
            if (current.matches && current.matches(selector)) {
                return current;
            }
            if (!current.matches && current.msMatchesSelector) {
                if (current.msMatchesSelector(selector)) {
                    return current;
                }
            }
            current = current.parentElement;
        }
        return null;
    }

    setupStarEvents() {
        document.addEventListener("click", (e) => {
            const star = this.findClosest(e.target, ".star-rating .star");
            if (star) {
                const rating = star.dataset.rating;
                const ratingInput = document.getElementById("rating-value");
                const currentRating = ratingInput ? ratingInput.value : "";
                
                if (currentRating == rating) {
                    if (ratingInput) ratingInput.value = "";
                    this.saveStarSelection(0);
                } else {
                    if (ratingInput) ratingInput.value = rating;
                    this.saveStarSelection(rating);
                }
            }
        });

        document.addEventListener("mouseenter", (e) => {
            const star = this.findClosest(e.target, ".star-rating .star");
            if (star) {
                const rating = star.dataset.rating;
                this.showStarPreview(rating);
            }
        }, true);

        document.addEventListener("mouseleave", (e) => {
            const starRating = this.findClosest(e.target, ".star-rating");
            if (starRating) {
                const ratingInput = document.getElementById("rating-value");
                const savedRating = ratingInput ? ratingInput.value : "";
                this.showStarPreview(savedRating);
            }
        }, true);
    }

    openRatingModal(game, existingRating = null) {
        if (!this.validateAuthentication()) return;

        this.currentGameData = game;
        this.currentRatingData = existingRating;

        if (!document.getElementById("rating-modal")) {
            this.createRatingModal();
        }

        this.setupModalContent(game, existingRating);
        this.loadExistingRatings(game.id_Game);
        this.showModal();
    }

    setupModalContent(game, existingRating) {
        const gameName = document.getElementById("rating-game-name");
        const gameImage = document.getElementById("rating-game-image");
        const ratingForm = document.getElementById("rating-form");
        
        if (gameName) {
            gameName.textContent = game.name_Game;
            gameName.dataset.gameId = game.id_Game;
        }
        
        if (gameImage) {
            gameImage.src = game.image_Url;
            gameImage.alt = game.name_Game;
        }

        if (ratingForm) {
            ratingForm.reset();
        }
        
        const stars = document.querySelectorAll(".star-rating .star");
        stars.forEach(star => star.classList.remove("active"));

        if (existingRating) {
            this.setupExistingRating(existingRating);
        } else {
            this.setupNewRating();
        }
    }

    setupExistingRating(existingRating) {
        const ratingValue = existingRating.Rating_Value || existingRating.rating || existingRating.value || 0;
        const ratingComment = existingRating.Comment || existingRating.comment || "";
        const ratingId = existingRating.Id_Rating || existingRating.id;
        
        const ratingInput = document.getElementById("rating-value");
        const commentInput = document.getElementById("rating-comment");
        const submitButton = document.getElementById("submit-rating");
        const ratingForm = document.getElementById("rating-form");
        
        if (ratingInput) ratingInput.value = ratingValue;
        if (commentInput) commentInput.value = ratingComment;
        
        this.saveStarSelection(ratingValue);

        if (submitButton) submitButton.textContent = "Atualizar Avaliação";
        if (ratingForm) {
            ratingForm.dataset.ratingId = ratingId;
            ratingForm.dataset.isUpdate = "true";
        }
    }

    setupNewRating() {
        const submitButton = document.getElementById("submit-rating");
        const ratingForm = document.getElementById("rating-form");
        
        if (submitButton) submitButton.textContent = "Enviar Avaliação";
        if (ratingForm) {
            delete ratingForm.dataset.ratingId;
            ratingForm.dataset.isUpdate = "false";
        }
        this.updateRatingFeedback(0);
    }

    showModal() {
        const modal = document.getElementById("rating-modal");
        const overlay = document.getElementById("overlay");
        
        if (modal) modal.classList.add("show");
        if (overlay) overlay.classList.add("active");
        this.isModalOpen = true;
    }

    closeRatingModal() {
        const modal = document.getElementById("rating-modal");
        const overlay = document.getElementById("overlay");
        
        if (modal) modal.classList.remove("show");
        if (overlay) overlay.classList.remove("active");
        this.isModalOpen = false;
        this.currentGameData = null;
        this.currentRatingData = null;
    }

    createRatingModal() {
        const modal = document.createElement("div");
        modal.id = "rating-modal";
        modal.className = "rating-modal";
        modal.innerHTML = `
            <div class="rating-content">
                <div class="rating-header">
                    <h3>Avaliar Jogo</h3>
                    <button class="close-modal">&times;</button>
                </div>
                
                <div class="rating-game-info">
                    <img id="rating-game-image" src="" alt="">
                    <h4 id="rating-game-name"></h4>
                </div>
                
                <form id="rating-form">
                    <div class="rating-section">
                        <label>Sua Avaliação:</label>
                        <div class="star-rating">
                            <span class="star" data-rating="1"><i class="fi fi-rr-star"></i></span>
                            <span class="star" data-rating="2"><i class="fi fi-rr-star"></i></span>
                            <span class="star" data-rating="3"><i class="fi fi-rr-star"></i></span>
                            <span class="star" data-rating="4"><i class="fi fi-rr-star"></i></span>
                            <span class="star" data-rating="5"><i class="fi fi-rr-star"></i></span>
                        </div>
                        <input type="hidden" id="rating-value" name="rating" required>
                    </div>
                    
                    <div class="rating-section">
                        <label for="rating-comment">Comentário (opcional):</label>
                        <textarea id="rating-comment" name="comment" rows="4" 
                            placeholder="Conte sua experiência com este jogo..."></textarea>
                    </div>
                    
                    <div class="rating-actions">
                        <button type="button" class="cancel-rating">Cancelar</button>
                        <button type="submit" id="submit-rating">Enviar Avaliação</button>
                    </div>
                </form>
                
                <div class="existing-ratings-section">
                    <h4>Avaliações Existentes</h4>
                    <div id="existing-ratings-list" class="ratings-list">
                        <div class="loading-ratings">Carregando avaliações...</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupModalEvents();
        this.setupStarEvents();
    }

    setupModalEvents() {
        document.addEventListener("click", (e) => {
            if (e.target.matches && e.target.matches(".close-modal, .cancel-rating")) {
                this.closeRatingModal();
            } else if (e.target.msMatchesSelector && e.target.msMatchesSelector(".close-modal, .cancel-rating")) {
                this.closeRatingModal();
            } else if (e.target.classList.contains("close-modal") || e.target.classList.contains("cancel-rating")) {
                this.closeRatingModal();
            }
        });

        document.addEventListener("submit", (e) => {
            if (e.target && e.target.id === "rating-form") {
                e.preventDefault();
                this.handleFormSubmit();
            }
        });
    }

    async handleFormSubmit() {
        const ratingInput = document.getElementById("rating-value");
        const commentInput = document.getElementById("rating-comment");
        const ratingForm = document.getElementById("rating-form");
        const gameName = document.getElementById("rating-game-name");
        
        const rating = ratingInput ? ratingInput.value : "";
        const comment = commentInput ? commentInput.value : "";
        const isUpdate = ratingForm ? ratingForm.dataset.isUpdate === "true" : false;
        const ratingId = ratingForm ? ratingForm.dataset.ratingId : "";
        
        if (!this.validateRatingData(rating)) return;

        const gameId = gameName ? gameName.dataset.gameId : "";
        let success = false;

        if (isUpdate && ratingId) {
            success = await this.updateRatingAPI(ratingId, parseInt(rating), comment);
        } else {
            success = await this.submitRatingAPI(gameId, parseInt(rating), comment);
        }

        if (success) {
            await this.loadExistingRatings(gameId);
            setTimeout(() => this.closeRatingModal(), 1000);
        }
    }

    async loadExistingRatings(gameId) {
        try {
            console.log("Carregando avaliações para o jogo ID:", gameId);
            
            const response = await this.authenticatedRequest({
                method: "GET",
                url: `/Rating/game/${gameId}`
            });
            
            const ratings = response.data?.data || [];
            console.log("Avaliações carregadas:", ratings);
            
            await this.loadUserDataForRatings(ratings);
            this.displayExistingRatings(ratings);
        } catch (error) {
            console.error("Erro ao carregar avaliações:", error);
            this.displayExistingRatings([]);
        }
    }

    async loadUserDataForRatings(ratings) {
        if (ratings.length === 0) return;

        const ratingsList = document.getElementById("existing-ratings-list");
        if (ratingsList) {
            ratingsList.innerHTML = "<div class=\"loading-ratings\">Carregando dados dos usuários...</div>";
        }
        
        console.log(`Carregando dados para ${ratings.length} avaliações`);
        
        const userPromises = ratings.map(async (rating) => {
            if (rating.UserName?.trim()) {
                console.log("Avaliação já tem UserName:", rating.UserName);
                return;
            }
            
            const userId = rating.Id_User;
            console.log("Carregando dados do usuário ID:", userId);
            
            if (userId) {
                try {
                    const userData = await this.getUserById(userId);
                    if (userData) {
                        rating.UserData = userData;
                        rating.UserName = userData.Name_User || "Usuário";
                        console.log("Nome do usuário definido:", rating.UserName);
                    } else {
                        rating.UserName = `Usuário #${userId}`;
                        console.log("Usando nome padrão para usuário:", rating.UserName);
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados do usuário:", error);
                    rating.UserName = `Usuário #${userId}`;
                }
            } else {
                rating.UserName = "Usuário Anônimo";
            }
        });

        await Promise.all(userPromises);
        console.log("Dados dos usuários carregados:", ratings);
    }

    displayExistingRatings(ratings) {
        const ratingsList = document.getElementById("existing-ratings-list");
        
        if (!ratingsList) return;
        
        console.log("Exibindo avaliações:", ratings);
        
        if (ratings.length === 0) {
            ratingsList.innerHTML = "<div class=\"no-ratings\">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</div>";
            return;
        }
        
        const ratingsHtml = ratings.map((rating) => {
            const ratingValue = Number(rating.Rating_Value || rating.rating || rating.value || 0);
            const stars = this.generateStarsHTML(ratingValue);
            const date = new Date(rating.Created_At).toLocaleDateString("pt-BR");
            const userName = rating.UserName || "Usuário";
            
            return `
                <div class="rating-item">
                    <div class="rating-header-item">
                        <div class="rating-user-info">
                            <span class="rating-username">${userName}</span>
                            <span class="rating-date">${date}</span>
                        </div>
                        <div class="rating-stars-display">
                            ${stars}
                        </div>
                    </div>
                    ${rating.Comment ? `<div class="rating-comment-text">${rating.Comment}</div>` : ""}
                </div>
            `;
        }).join("");
        
        ratingsList.innerHTML = ratingsHtml;
    }

    generateStarsHTML(rating) {
        let ratingValue = Number(rating);
        if (isNaN(ratingValue) || ratingValue < 0) ratingValue = 0;
        if (ratingValue > 5) ratingValue = 5;
        
        let starsHtml = "";
        for (let i = 1; i <= ratingValue; i++) {
            starsHtml += "<span class=\"star filled\"><i class=\"fi fi-rr-star\"></i></span>";
        }
        return starsHtml;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const ratingSystem = new RatingSystem();
    console.log("Sistema de Avaliações inicializado:", ratingSystem);
});