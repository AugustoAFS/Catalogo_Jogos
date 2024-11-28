namespace Server_Catalogo_jogos.models
{
    public class CartModel
    {
        private int Id { get; set; }
        private decimal ValueTotal { get; set; }
        private List<GameModel>? Games { get; set; }
        private DateTime DateCreatedCart { get; set; }
        private DateTime DateModifiedCart { get; set; }
        private DateTime DateBuyCart { get; set; }
    }
}
