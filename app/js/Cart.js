"use strict"
$(document).ready(function () {
    
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const rightSidebar = document.getElementById("right-sidebar");
    const overlay = document.getElementById("overlay");
    const cartItemsContainer = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");

    let cartItems = [];

    function addToCart(id, name, price) {
        const item = { id, name, price };
        cartItems.push(item);
        updateCart();
    }

    function updateCart() {
        cartItemsContainer.innerHTML = "";
        let total = 0;

        cartItems.forEach(item => {
            const itemElement = document.createElement("div");
            itemElement.classList.add("cart-item");
            itemElement.innerHTML = `
                <p>${item.name}</p>
                <p>R$ ${item.price.toFixed(2)}</p>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price;
        });

        totalPriceElement.innerText = `R$: ${total.toFixed(2)}`;
    }

    openCartBtn.addEventListener("click", () => {
        rightSidebar.classList.add("open");
        overlay.classList.add("active");
        updateCart();
    });

    closeCartBtn.addEventListener("click", () => {
        rightSidebar.classList.remove("open");
        overlay.classList.remove("active");
    });

    overlay.addEventListener("click", () => {
        rightSidebar.classList.remove("open");
        overlay.classList.remove("active");
    });

    $(document).on("click", ".add-to-cart", function () {
        const gameName = $(this).closest(".card-details").find("h3").text();
        alert(`"${gameName}" foi adicionado ao seu carrinho!`);
    });
});
