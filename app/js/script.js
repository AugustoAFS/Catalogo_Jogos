$(document).ready(function () {
    // Dados fictícios para os cards
    const games = [
        { name: "Ghost of Tsushima", price: "R$ 200,00", img: "assets/ghost.webp" },
        { name: "Elden Ring", price: "R$ 250,00", img: "assets/elden_ring.webp" },
        { name: "Demon's Souls", price: "R$ 300,00", img: "assets/demon_souls.png" },
        { name: "God of War", price: "R$ 220,00", img: "assets/god1.webp" },
    ];

    // Renderiza os cards dinamicamente
    function renderCards(gamesArray, containerId) {
        gamesArray.forEach((game) => {
            const card = `
                <div class="card" tabindex="0">
                    <img src="${game.img}" alt="${game.name}">
                    <div class="card-details">
                        <h3>${game.name}</h3>
                        <p>${game.price}</p>
                        <button class="add-to-cart">Colocar no carrinho</button>
                        <div class="rating">
                            <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                        </div>
                    </div>
                </div>
            `;
            $(`#${containerId}`).append(card);
        });
    }

    // Inicializa os cards
    renderCards(games, "favorites");
    renderCards(games, "action");

    // Função de busca
    $("#search-btn").click(function () {
        const query = $("#search-input").val().toLowerCase();
        $(".card").each(function () {
            const title = $(this).find("h3").text().toLowerCase();
            $(this).toggle(title.includes(query));
        });
    });

    // Inscrição no Games+
    $("#subscribe-btn").click(function () {
        alert("Você se inscreveu no Augusto Games+!");
    });
});


$(document).ready(function () {
    $(".add-to-cart").on("click", function () {
        const gameName = $(this).closest(".card-details").find("h3").text();
        alert(`"${gameName}" foi adicionado ao seu carrinho!`);
    });
});
