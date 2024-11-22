$(document).ready(function () {
    $('#settings-btn').on('click', function () {
        $('#sidebar').animate({ left: '0px' }, 300);
    });

    $('#close-sidebar').on('click', function () {
        $('#sidebar').animate({ left: '-300px' }, 300);
    });

    $('#cart-btn').on('click', function () {
        $('#cart').animate({ right: '0px' }, 300);
    });

    $('#close-cart').on('click', function () {
        $('#cart').animate({ right: '-300px' }, 300);
    });

    $('.nav-link').on('click', function () {
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
    });

    function addToCart(itemName, price) {
        const cartItem = `
            <li>
                ${itemName} - R$${price.toFixed(2)}
                <button class="remove-item">Remover</button>
            </li>
        `;
        $('#cart-items').append(cartItem);
        updateTotal();
    }

    function updateTotal() {
        let total = 0;
        $('#cart-items li').each(function () {
            const priceText = $(this).text().split(' - ')[1].split(' R$')[1];
            total += parseFloat(priceText);
        });
        $('#total-price').text(total.toFixed(2));
    }

    $('#cart-items').on('click', '.remove-item', function () {
        $(this).parent().remove();
        updateTotal();
    });

    $('.add-to-cart').on('click', function () {
        const itemName = $(this).data('name');
        const price = $(this).data('price');
        addToCart(itemName, price);
    });
});