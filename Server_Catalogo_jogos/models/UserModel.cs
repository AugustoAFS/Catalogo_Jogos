namespace Server_Catalogo_jogos.models
{
    public class UserModel
    {
        public int Id { get; set; }
        private string? Name { get; set; }
        private string? Email { get; set; }
        private string? Password { get; set; }

        private List<CartModel>? Cart { get; set; }

    }
}
