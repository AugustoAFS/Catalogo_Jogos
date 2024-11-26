"use strict";

$(document).ready(function () {
    const games = [
        { id: 1, name: "Ghost of Tsushima", price: 200.00, img: "assets/ghost.webp" },
        { id: 2, name: "Elden Ring", price: 250.00, img: "assets/elden_ring.webp" },
        { id: 3, name: "God of War", price: 150.00, img: "assets/god1.webp" },
        { id: 4, name: "God of War 2", price: 200.00, img: "assets/god2.webp" },
        { id: 5, name: "God of War 3", price: 250.00, img: "assets/god3.webp" },
        { id: 6, name: "God of War: 2018", price: 300.00, img: "assets/god4.webp" },
        { id: 7, name: "God of War: Ragnarok", price: 350.00, img: "assets/god5.webp" },
        { id: 8, name: "Demon Souls", price: 300.00, img: "assets/demon_souls.png" },
    ];

    let cart = [];

    function formatPrice(price) {
        return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function renderCards(gamesArray, containerId) {
        $(`#${containerId}`).empty(); 
        gamesArray.forEach((game) => {
            const card = `
                <div class="card" tabindex="0">
                    <img src="${game.img}" alt="${game.name}">
                    <div class="card-details">
                        <h3>${game.name}</h3>
                        <p>${formatPrice(game.price)}</p>
                        <button class="add-to-cart" data-id="${game.id}" data-name="${game.name}" data-price="${game.price}" data-img="${game.img}">Adicionar ao carrinho</button>
                        <div class="rating">
                            ${'<span>⭐</span>'.repeat(5)}
                        </div>
                    </div>
                </div>
            `;
            $(`#${containerId}`).append(card);
        });
    }

    renderCards(games, "favorites");
    renderCards([...games].sort(() => 0.5 - Math.random()), "action");

    $(document).on("click", ".add-to-cart", function () {
        const gameId = $(this).data("id");
        const gameName = $(this).data("name");
        const gamePrice = $(this).data("price");
        const gameImg = $(this).data("img");

        cart.push({ id: gameId, name: gameName, price: gamePrice, img: gameImg });

        updateCart();
        alert(`${gameName} foi adicionado ao carrinho!`);
    });

    function updateCart() {
        const cartContainer = $("#cart-items");
        const totalPriceElement = $("#total-price");

        cartContainer.empty();

        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price;

            const itemElement = `
            <section class="cart-item">
                <img src="${item.img}" alt="${item.name}" class="cart-img">
                <p class="item-price-name">${item.name} - ${formatPrice(itemTotal)}</p>
            </section>
            `;

            cartContainer.append(itemElement);
            total += itemTotal;
        });

        totalPriceElement.html(`
            <div class="cart-total">
                <p class="cart-total">Total: ${formatPrice(total)}</p>
            </div>
        `);
    }

    $("#clear-cart-btn").click(function () {
        cart = [];
        updateCart();
        alert("Carrinho limpo!");
    });

    $("#open-right-sidebar").click(function () {
        $("#right-sidebar").toggleClass("open");
    });

    $("#close-cart").click(function () {
        $("#right-sidebar").removeClass("open");
    });

    $("#search-btn").click(function () {
        const searchText = $("#search-input").val().toLowerCase();

        const filteredGames = games.filter((game) => 
            game.name.toLowerCase().includes(searchText)
        );

        renderCards(filteredGames, "favorites");
        renderCards(filteredGames, "action");
    });

    $("#search-input").keypress(function (e) {
        if (e.which === 13) {
            $("#search-btn").click();
        }
    });
});
