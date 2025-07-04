using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Application.DTOs;
using Core.Entities;
using Core.Interfaces;
using Core.Exceptions;

namespace Application.Services
{
    public class RatingService : IRatingService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<RatingService> _logger;

        public RatingService(ApplicationDbContext context, IMapper mapper, ILogger<RatingService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<RatingDto>> GetAllRatingsAsync()
        {
            try
            {
                var ratings = await _context.Ratings
                    .ToListAsync();

                return _mapper.Map<List<RatingDto>>(ratings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar todas as avaliações");
                throw;
            }
        }

        public async Task<RatingDto> GetRatingByIdAsync(int id)
        {
            try
            {
                var rating = await _context.Ratings
                    .FirstOrDefaultAsync(r => r.Id_Rating == id);

                if (rating == null)
                {
                    throw new InvalidOperationException($"Avaliação com ID {id} não encontrada");
                }

                return _mapper.Map<RatingDto>(rating);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar avaliação com ID {RatingId}", id);
                throw;
            }
        }

        public async Task<RatingDto> CreateRatingAsync(CreateRatingDto createRatingDto)
        {
            try
            {
                // Verificar se o jogo existe
                var game = await _context.Games.FindAsync(createRatingDto.Id_Game);
                if (game == null)
                {
                    throw new GameNotFoundException(createRatingDto.Id_Game);
                }

                // Verificar se o usuário existe
                var user = await _context.Users.FindAsync(createRatingDto.Id_User);
                if (user == null)
                {
                    throw new InvalidOperationException($"Usuário com ID {createRatingDto.Id_User} não encontrado");
                }

                // Verificar se já existe uma avaliação do mesmo usuário para o mesmo jogo
                var existingRating = await _context.Ratings
                    .FirstOrDefaultAsync(r => r.Id_Game == createRatingDto.Id_Game && r.Id_User == createRatingDto.Id_User);

                if (existingRating != null)
                {
                    throw new InvalidOperationException("Usuário já avaliou este jogo");
                }

                var rating = new Rating
                {
                    Id_Game = createRatingDto.Id_Game,
                    Id_User = createRatingDto.Id_User,
                    Rating_Value = createRatingDto.Rating_Value,
                    Comment = createRatingDto.Comment ?? string.Empty,
                    Created_At = DateTime.Now
                };

                _context.Ratings.Add(rating);
                await _context.SaveChangesAsync();

                // Buscar a avaliação com dados relacionados
                var ratingWithDetails = await _context.Ratings
                    .FirstOrDefaultAsync(r => r.Id_Rating == rating.Id_Rating);

                return _mapper.Map<RatingDto>(ratingWithDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar avaliação");
                throw;
            }
        }

        public async Task<RatingDto> UpdateRatingAsync(int id, UpdateRatingDto updateRatingDto)
        {
            try
            {
                var rating = await _context.Ratings.FindAsync(id);
                if (rating == null)
                {
                    throw new InvalidOperationException($"Avaliação com ID {id} não encontrada");
                }

                rating.Rating_Value = updateRatingDto.Rating_Value;
                rating.Comment = updateRatingDto.Comment ?? string.Empty;
                rating.Updated_At = DateTime.Now;

                await _context.SaveChangesAsync();

                // Buscar a avaliação com dados relacionados
                var ratingWithDetails = await _context.Ratings
                    .FirstOrDefaultAsync(r => r.Id_Rating == id);

                return _mapper.Map<RatingDto>(ratingWithDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar avaliação com ID {RatingId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteRatingAsync(int id)
        {
            try
            {
                var rating = await _context.Ratings.FindAsync(id);
                if (rating == null)
                {
                    return false;
                }

                _context.Ratings.Remove(rating);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao deletar avaliação com ID {RatingId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<RatingDto>> GetRatingsByGameAsync(int gameId)
        {
            try
            {
                var ratings = await _context.Ratings
                    .Where(r => r.Id_Game == gameId)
                    .OrderByDescending(r => r.Created_At)
                    .ToListAsync();

                return _mapper.Map<List<RatingDto>>(ratings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar avaliações do jogo {GameId}", gameId);
                throw;
            }
        }

        public async Task<IEnumerable<RatingDto>> GetRatingsByUserAsync(int userId)
        {
            try
            {
                var ratings = await _context.Ratings
                    .Where(r => r.Id_User == userId)
                    .OrderByDescending(r => r.Created_At)
                    .ToListAsync();

                return _mapper.Map<List<RatingDto>>(ratings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar avaliações do usuário {UserId}", userId);
                throw;
            }
        }

        public async Task<GameRatingSummaryDto> GetGameRatingSummaryAsync(int gameId)
        {
            try
            {
                var game = await _context.Games
                    .FirstOrDefaultAsync(g => g.Id_Game == gameId);

                if (game == null)
                {
                    throw new GameNotFoundException(gameId);
                }

                var ratings = await _context.Ratings
                    .Where(r => r.Id_Game == gameId)
                    .OrderByDescending(r => r.Created_At)
                    .ToListAsync();

                var ratingDtos = _mapper.Map<List<RatingDto>>(ratings);

                return new GameRatingSummaryDto
                {
                    Id_Game = gameId,
                    GameName = game.Name_Game,
                    AverageRating = 0,
                    TotalRatings = 0,
                    Ratings = ratingDtos
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar resumo de avaliações do jogo {GameId}", gameId);
                throw;
            }
        }
    }
} 