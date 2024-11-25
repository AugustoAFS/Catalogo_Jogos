"use strict"
$(document).ready(function () {
    // Lista de jogos
    const games = [
        { name: "Ghost of Tsushima", price: 200.00, img: "assets/ghost.webp" },
        { name: "Elden Ring", price: 250.00, img: "assets/elden_ring.webp" },
        { name: "God of War", price: 150.00, img: "assets/god1.webp" },
        { name: "God of War 2", price: 200.00, img: "assets/god2.webp" },
        { name: "God of War 3", price: 250.00, img: "assets/god3.webp" },
        { name: "God of War: 2018", price: 300.00, img: "assets/god4.webp" },
        { name: "God of War: Ragnarok", price: 350.00, img: "assets/god5.webp" },
        { name: "Demon Souls", price: 300.00, img: "assets/demon_souls.png" },
    ];

    function formatPrice(price) {
        return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function renderCards(gamesArray, containerId) {
        gamesArray.forEach((game) => {
            const card = `
                <div class="card" tabindex="0">
                    <img src="${game.img}" alt="${game.name}">
                    <div class="card-details">
                        <h3>${game.name}</h3>
                        <p>${formatPrice(game.price)}</p>
                        <button class="add-to-cart">Colocar no carrinho</button>
                        <div class="rating">
                            ${'<span>⭐</span>'.repeat(5)}
                        </div>
                    </div>
                </div>
            `;
            $(`#${containerId}`).append(card);
        });
    }

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    const shuffledGames = shuffleArray([...games]);

    renderCards(games, "favorites");

    renderCards(shuffledGames, "action");

    $("#search-btn").click(function () {
        const query = $("#search-input").val().toLowerCase();
        $(".card").each(function () {
            const title = $(this).find("h3").text().toLowerCase();
            $(this).toggle(title.includes(query));
        });
    });

    $("#search-input").on("keypress", function (e) {
        if (e.which === 13) $("#search-btn").click();
    });
    
    $(document).on("click", ".add-to-cart", function () {
        const gameName = $(this).closest(".card-details").find("h3").text();
        alert(`"${gameName}" foi adicionado ao seu carrinho!`);
    });
});
