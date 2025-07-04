using Application.DTOs;

namespace Core.Interfaces
{
    public interface IGameService
    {
        Task<IEnumerable<GameDto>> GetAllGamesAsync();
        Task<GameDto> GetGameByIdAsync(int id);
        Task<IEnumerable<GameDto>> GetGamesByCategoryAsync(string category);
        Task<GameDto> CreateGameAsync(CreateGameDto createGameDto);
        Task<GameDto> UpdateGameAsync(int id, UpdateGameDto updateGameDto);
        Task<bool> DeleteGameAsync(int id);
        Task<IEnumerable<GameDto>> SearchGamesAsync(string searchTerm);
    }
} 