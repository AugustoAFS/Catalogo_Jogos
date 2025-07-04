using Application.DTOs;

namespace Core.Interfaces
{
    public interface IRatingService
    {
        Task<IEnumerable<RatingDto>> GetAllRatingsAsync();
        Task<RatingDto> GetRatingByIdAsync(int id);
        Task<RatingDto> CreateRatingAsync(CreateRatingDto createRatingDto);
        Task<RatingDto> UpdateRatingAsync(int id, UpdateRatingDto updateRatingDto);
        Task<bool> DeleteRatingAsync(int id);
        Task<IEnumerable<RatingDto>> GetRatingsByGameAsync(int gameId);
        Task<IEnumerable<RatingDto>> GetRatingsByUserAsync(int userId);
        Task<GameRatingSummaryDto> GetGameRatingSummaryAsync(int gameId);
    }
} 