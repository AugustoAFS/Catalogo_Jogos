using Application.DTOs;

namespace Core.Interfaces
{
    public interface ICartService
    {
        Task<CartSummaryDto> GetUserCartAsync(int userId);
        Task<CartDto> AddToCartAsync(AddToCartDto addToCartDto);
        Task<CartDto> UpdateCartItemAsync(int id, UpdateCartItemDto updateCartItemDto);
        Task<bool> RemoveFromCartAsync(int id);
        Task<bool> ClearCartAsync(int userId);
    }
} 