using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Application.DTOs;
using Core.Entities;
using Core.Interfaces;
using Core.Exceptions;

namespace Application.Services
{
    public class CartService : ICartService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<CartService> _logger;

        public CartService(ApplicationDbContext context, IMapper mapper, ILogger<CartService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<CartSummaryDto> GetUserCartAsync(int userId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Include(c => c.Game)
                    .Where(c => c.Id_User == userId)
                    .ToListAsync();

                var cartDtos = _mapper.Map<List<CartDto>>(cartItems);
                var totalValue = cartDtos.Sum(c => (c.Game?.Price_Game ?? 0) * c.Quantity_Cart);

                return new CartSummaryDto
                {
                    Items = cartDtos,
                    TotalValue = totalValue,
                    ItemCount = cartDtos.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar carrinho do usuário {UserId}", userId);
                throw;
            }
        }

        public async Task<CartDto> AddToCartAsync(AddToCartDto addToCartDto)
        {
            try
            {
                // Verificar se o jogo existe
                var game = await _context.Games.FindAsync(addToCartDto.Id_Game);
                if (game == null)
                {
                    throw new GameNotFoundException(addToCartDto.Id_Game);
                }

                // Verificar se o item já está no carrinho
                var existingItem = await _context.CartItems
                    .FirstOrDefaultAsync(c => c.Id_User == addToCartDto.Id_User && c.Id_Game == addToCartDto.Id_Game);

                Cart cartItem;

                if (existingItem != null)
                {
                    // Atualizar quantidade
                    existingItem.Quantity_Cart += addToCartDto.Quantity;
                    cartItem = existingItem;
                }
                else
                {
                    // Adicionar novo item
                    cartItem = new Cart
                    {
                        Id_User = addToCartDto.Id_User,
                        Id_Game = addToCartDto.Id_Game,
                        Quantity_Cart = addToCartDto.Quantity,
                        Added_At = DateTime.Now
                    };
                    _context.CartItems.Add(cartItem);
                }

                await _context.SaveChangesAsync();

                // Retornar o item com o jogo incluído
                var cartWithGame = await _context.CartItems
                    .Include(c => c.Game)
                    .FirstOrDefaultAsync(c => c.Id_Cart == cartItem.Id_Cart);

                return _mapper.Map<CartDto>(cartWithGame);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao adicionar item ao carrinho");
                throw;
            }
        }

        public async Task<CartDto> UpdateCartItemAsync(int id, UpdateCartItemDto updateCartItemDto)
        {
            try
            {
                var existingItem = await _context.CartItems.FindAsync(id);
                if (existingItem == null)
                {
                    throw new CartItemNotFoundException(id);
                }

                if (updateCartItemDto.Quantity <= 0)
                {
                    throw new InvalidOperationException("A quantidade deve ser maior que zero");
                }

                existingItem.Quantity_Cart = updateCartItemDto.Quantity;
                await _context.SaveChangesAsync();

                var updatedItem = await _context.CartItems
                    .Include(c => c.Game)
                    .FirstOrDefaultAsync(c => c.Id_Cart == id);

                return _mapper.Map<CartDto>(updatedItem);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar item do carrinho {Id}", id);
                throw;
            }
        }

        public async Task<bool> RemoveFromCartAsync(int id)
        {
            try
            {
                var cartItem = await _context.CartItems.FindAsync(id);
                if (cartItem == null)
                {
                    return false;
                }

                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao remover item do carrinho {Id}", id);
                throw;
            }
        }

        public async Task<bool> ClearCartAsync(int userId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Where(c => c.Id_User == userId)
                    .ToListAsync();

                _context.CartItems.RemoveRange(cartItems);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao limpar carrinho do usuário {UserId}", userId);
                throw;
            }
        }
    }
} 