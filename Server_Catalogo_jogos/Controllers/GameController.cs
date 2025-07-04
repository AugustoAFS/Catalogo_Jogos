using Application.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    public class GameController : BaseController
    {
        private readonly IGameService _gameService;

        public GameController(IGameService gameService, ILogger<GameController> logger) 
            : base(logger)
        {
            _gameService = gameService;
        }

        /// <summary>
        /// Obtém todos os jogos
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "AdminOrUserPolicy")]
        public async Task<IActionResult> GetAllGames()
        {
            try
            {
                var games = await _gameService.GetAllGamesAsync();
                return Ok(new { success = true, data = games, message = "Jogos recuperados com sucesso" });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao buscar todos os jogos");
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Obtém um jogo por ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOrUserPolicy")]
        public async Task<IActionResult> GetGameById(int id)
        {
            try
            {
                var game = await _gameService.GetGameByIdAsync(id);
                return Ok(new { success = true, data = game, message = "Jogo encontrado com sucesso" });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao buscar jogo com ID {GameId}", id);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Cria um novo jogo
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> CreateGame([FromBody] CreateGameDto createGameDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Dados inválidos", errors = ModelState });
                }

                var game = await _gameService.CreateGameAsync(createGameDto);
                return CreatedAtAction(nameof(GetGameById), new { id = game.Id_Game }, 
                    new { success = true, data = game, message = "Jogo criado com sucesso" });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao criar jogo");
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Atualiza um jogo existente
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> UpdateGame(int id, [FromBody] UpdateGameDto updateGameDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Dados inválidos", errors = ModelState });
                }

                var game = await _gameService.UpdateGameAsync(id, updateGameDto);
                return Ok(new { success = true, data = game, message = "Jogo atualizado com sucesso" });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao atualizar jogo com ID {GameId}", id);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Remove um jogo
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> DeleteGame(int id)
        {
            try
            {
                var result = await _gameService.DeleteGameAsync(id);
                if (!result)
                {
                    return NotFound(new { success = false, message = "Jogo não encontrado" });
                }

                return HandleSuccess("Jogo removido com sucesso");
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao deletar jogo com ID {GameId}", id);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Busca jogos por categoria
        /// </summary>
        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetGamesByCategory(string category)
        {
            try
            {
                var games = await _gameService.GetGamesByCategoryAsync(category);
                return Ok(new { success = true, data = games, message = "Jogos da categoria recuperados com sucesso" });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao buscar jogos por categoria {Category}", category);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Busca jogos por termo de pesquisa
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> SearchGames([FromQuery] string term)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(term))
                {
                    return BadRequest(new { success = false, message = "Termo de pesquisa é obrigatório" });
                }

                var games = await _gameService.SearchGamesAsync(term);
                return Ok(new { success = true, data = games, message = "Busca realizada com sucesso" });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao buscar jogos com termo {SearchTerm}", term);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }
    }
} 