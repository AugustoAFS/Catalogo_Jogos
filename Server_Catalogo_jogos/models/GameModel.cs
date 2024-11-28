namespace Server_Catalogo_jogos.models
{
    public class GameModel
    {
        private int Id { get; set; }
        private string? Name { get; set; }
        private string? Description { get; set; }
        private string? Type { get; set; }
        private string? PhotoUrl {  get; set; }
        private decimal Value { get; set; }

    }
}
