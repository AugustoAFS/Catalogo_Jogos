using Application.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Core.Entities;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    [Authorize(Policy = "AdminOrUserPolicy")]
    public class CartController : BaseController
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService, ILogger<CartController> logger) : base(logger)
        {
            _cartService = cartService;
        }

        /// <summary>
        /// Obtém o carrinho de um usuário específico
        /// </summary>
        [HttpGet("{userId:int}")]
        [ProducesResponseType(typeof(CartSummaryDto), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<CartSummaryDto>> GetUserCart(int userId)
        {
            LogInformation("Buscando carrinho do usuário: {UserId}", userId);
            
            var cartSummary = await _cartService.GetUserCartAsync(userId);
            return HandleResult(cartSummary);
        }

        /// <summary>
        /// Adiciona um item ao carrinho
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(CartDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<CartDto>> AddToCart([FromBody] AddToCartDto addToCartDto)
        {
            if (!ModelState.IsValid)
            {
                LogWarning("Dados inválidos para adicionar ao carrinho");
                return BadRequest(ModelState);
            }

            LogInformation("Adicionando jogo {GameId} ao carrinho do usuário {UserId}", 
                addToCartDto.Id_Game, addToCartDto.Id_User);
            
            var cartItem = await _cartService.AddToCartAsync(addToCartDto);
            return HandleResult(cartItem);
        }

        /// <summary>
        /// Atualiza a quantidade de um item no carrinho
        /// </summary>
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(CartDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<CartDto>> UpdateCartItem(int id, [FromBody] UpdateCartItemDto updateCartItemDto)
        {
            if (!ModelState.IsValid)
            {
                LogWarning("Dados inválidos para atualizar item do carrinho {Id}", id);
                return BadRequest(ModelState);
            }

            LogInformation("Atualizando item do carrinho: {Id}", id);
            
            var cartItem = await _cartService.UpdateCartItemAsync(id, updateCartItemDto);
            return HandleResult(cartItem);
        }

        /// <summary>
        /// Remove um item do carrinho
        /// </summary>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> RemoveFromCart(int id)
        {
            LogInformation("Removendo item do carrinho: {Id}", id);
            
            var removed = await _cartService.RemoveFromCartAsync(id);
            
            if (!removed)
                return NotFound();

            return HandleSuccess("Item removido do carrinho com sucesso");
        }

        /// <summary>
        /// Limpa todo o carrinho de um usuário
        /// </summary>
        [HttpDelete("clear/{userId:int}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> ClearCart(int userId)
        {
            LogInformation("Limpando carrinho do usuário: {UserId}", userId);
            
            await _cartService.ClearCartAsync(userId);
            return HandleSuccess("Carrinho limpo com sucesso");
        }
    }
} 