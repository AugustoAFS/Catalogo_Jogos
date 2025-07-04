using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Application.DTOs;
using Core.Entities;
using Core.Interfaces;
using Core.Exceptions;

namespace Application.Services
{
    public class GameService : IGameService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<GameService> _logger;

        public GameService(ApplicationDbContext context, IMapper mapper, ILogger<GameService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<GameDto>> GetAllGamesAsync()
        {
            try
            {
                var games = await _context.Games
                    .ToListAsync();

                var gameDtos = _mapper.Map<List<GameDto>>(games);

                // Por enquanto, definir valores padrão para as avaliações
                foreach (var gameDto in gameDtos)
                {
                    gameDto.TotalRatings = 0;
                    gameDto.AverageRating = 0;
                }

                return gameDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar todos os jogos");
                throw;
            }
        }

        public async Task<GameDto> GetGameByIdAsync(int id)
        {
            try
            {
                var game = await _context.Games
                    .FirstOrDefaultAsync(g => g.Id_Game == id);

                if (game == null)
                {
                    throw new GameNotFoundException(id);
                }

                var gameDto = _mapper.Map<GameDto>(game);
                gameDto.TotalRatings = 0;
                gameDto.AverageRating = 0;

                return gameDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar jogo com ID {GameId}", id);
                throw;
            }
        }

        public async Task<GameDto> CreateGameAsync(CreateGameDto createGameDto)
        {
            try
            {
                var game = _mapper.Map<Game>(createGameDto);
                
                _context.Games.Add(game);
                await _context.SaveChangesAsync();

                var gameDto = _mapper.Map<GameDto>(game);
                return gameDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar jogo");
                throw;
            }
        }

        public async Task<GameDto> UpdateGameAsync(int id, UpdateGameDto updateGameDto)
        {
            try
            {
                var game = await _context.Games.FindAsync(id);
                if (game == null)
                {
                    throw new GameNotFoundException(id);
                }

                // Atualizar propriedades
                if (!string.IsNullOrEmpty(updateGameDto.Name_Game))
                    game.Name_Game = updateGameDto.Name_Game;

                if (!string.IsNullOrEmpty(updateGameDto.Description_Game))
                    game.Description_Game = updateGameDto.Description_Game;

                if (!string.IsNullOrEmpty(updateGameDto.Category_Game))
                    game.Category_Game = updateGameDto.Category_Game;

                if (!string.IsNullOrEmpty(updateGameDto.Image_Url))
                    game.Image_Url = updateGameDto.Image_Url;

                if (updateGameDto.Price_Game.HasValue)
                    game.Price_Game = updateGameDto.Price_Game.Value;

                await _context.SaveChangesAsync();

                var gameDto = _mapper.Map<GameDto>(game);
                return gameDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar jogo com ID {GameId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteGameAsync(int id)
        {
            try
            {
                var game = await _context.Games.FindAsync(id);
                if (game == null)
                {
                    return false;
                }

                _context.Games.Remove(game);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao deletar jogo com ID {GameId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<GameDto>> GetGamesByCategoryAsync(string category)
        {
            try
            {
                var games = await _context.Games
                    .Where(g => g.Category_Game.ToLower() == category.ToLower())
                    .ToListAsync();

                var gameDtos = _mapper.Map<List<GameDto>>(games);

                // Calcular média de avaliações para cada jogo
                foreach (var gameDto in gameDtos)
                {
                    var game = games.First(g => g.Id_Game == gameDto.Id_Game);
                    gameDto.TotalRatings = 0;
                    gameDto.AverageRating = 0;
                }

                return gameDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar jogos por categoria {Category}", category);
                throw;
            }
        }

        public async Task<IEnumerable<GameDto>> SearchGamesAsync(string searchTerm)
        {
            try
            {
                var games = await _context.Games    
                    .Where(g => g.Name_Game.ToLower().Contains(searchTerm.ToLower()) ||
                               g.Description_Game.ToLower().Contains(searchTerm.ToLower()) ||
                               g.Category_Game.ToLower().Contains(searchTerm.ToLower()))
                    .ToListAsync();

                var gameDtos = _mapper.Map<List<GameDto>>(games);

                // Calcular média de avaliações para cada jogo
                foreach (var gameDto in gameDtos)
                {
                    var game = games.First(g => g.Id_Game == gameDto.Id_Game);
                    gameDto.TotalRatings = 0;
                    gameDto.AverageRating = 0;
                }

                return gameDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar jogos com termo {SearchTerm}", searchTerm);
                throw;
            }
        }
    }
} 