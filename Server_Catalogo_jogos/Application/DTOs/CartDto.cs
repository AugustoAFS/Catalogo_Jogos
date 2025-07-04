using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class CartDto
    {
        public int Id_Cart { get; set; }
        public int Id_User { get; set; }
        public int Id_Game { get; set; }
        public int Quantity_Cart { get; set; }
        public DateTime Added_At { get; set; }
        public GameDto Game { get; set; } = null!;
    }

    public class CartSummaryDto
    {
        public List<CartDto> Items { get; set; } = new List<CartDto>();
        public decimal TotalValue { get; set; }
        public int ItemCount { get; set; }
    }

    public class AddToCartDto
    {
        public int Id_User { get; set; }
        public int Id_Game { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateCartItemDto
    {
        public int Quantity { get; set; }
    }
} 