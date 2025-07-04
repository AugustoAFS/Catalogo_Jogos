namespace Core.Exceptions
{
    public class GameNotFoundException : Exception
    {
        public GameNotFoundException(int id) : base($"Jogo com ID {id} não foi encontrado.")
        {
            Id = id;
        }

        public int Id { get; }
    }
} 