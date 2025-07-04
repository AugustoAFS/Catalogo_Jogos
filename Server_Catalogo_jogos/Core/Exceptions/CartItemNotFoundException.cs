namespace Core.Exceptions
{
    public class CartItemNotFoundException : Exception
    {
        public CartItemNotFoundException(int id) : base($"Item do carrinho com ID {id} não foi encontrado.")
        {
            Id = id;
        }

        public int Id { get; }
    }
} 