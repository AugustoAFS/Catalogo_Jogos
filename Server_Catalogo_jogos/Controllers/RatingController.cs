using Microsoft.AspNetCore.Mvc;
using Application.DTOs;
using Core.Interfaces;
using Microsoft.Extensions.Logging;
using Core.Entities;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    [Authorize(Policy = "AdminOrUserPolicy")]
    [ApiController]
    [Route("api/[controller]")]
    public class RatingController : BaseController
    {
        private readonly IRatingService _ratingService;

        public RatingController(IRatingService ratingService, ILogger<RatingController> logger) : base(logger)
        {
            _ratingService = ratingService;
        }

        /// <summary>
        /// Obtém todas as avaliações
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllRatings()
        {
            try
            {
                var ratings = await _ratingService.GetAllRatingsAsync();
                return Ok(new { success = true, data = ratings, message = "Avaliações recuperadas com sucesso" });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao buscar todas as avaliações");
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Obtém uma avaliação por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRatingById(int id)
        {
            try
            {
                var rating = await _ratingService.GetRatingByIdAsync(id);
                return Ok(new { success = true, data = rating, message = "Avaliação encontrada com sucesso" });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao buscar avaliação com ID {RatingId}", id);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Cria uma nova avaliação
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateRating([FromBody] CreateRatingDto createRatingDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Dados inválidos", errors = ModelState });
                }

                var rating = await _ratingService.CreateRatingAsync(createRatingDto);
                return CreatedAtAction(nameof(GetRatingById), new { id = rating.Id_Rating }, 
                    new { success = true, data = rating, message = "Avaliação criada com sucesso" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao criar avaliação");
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Atualiza uma avaliação existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRating(int id, [FromBody] UpdateRatingDto updateRatingDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Dados inválidos", errors = ModelState });
                }

                var rating = await _ratingService.UpdateRatingAsync(id, updateRatingDto);
                return Ok(new { success = true, data = rating, message = "Avaliação atualizada com sucesso" });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao atualizar avaliação com ID {RatingId}", id);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Remove uma avaliação
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRating(int id)
        {
            try
            {
                var result = await _ratingService.DeleteRatingAsync(id);
                if (!result)
                {
                    return NotFound(new { success = false, message = "Avaliação não encontrada" });
                }

                return HandleSuccess("Avaliação removida com sucesso");
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao deletar avaliação com ID {RatingId}", id);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Obtém avaliações de um jogo específico
        /// </summary>
        [HttpGet("game/{gameId}")]
        public async Task<IActionResult> GetRatingsByGame(int gameId)
        {
            try
            {
                var ratings = await _ratingService.GetRatingsByGameAsync(gameId);
                return Ok(new { success = true, data = ratings, message = "Avaliações do jogo recuperadas com sucesso" });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao buscar avaliações do jogo {GameId}", gameId);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Obtém avaliações de um usuário específico
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetRatingsByUser(int userId)
        {
            try
            {
                var ratings = await _ratingService.GetRatingsByUserAsync(userId);
                return Ok(new { success = true, data = ratings, message = "Avaliações do usuário recuperadas com sucesso" });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao buscar avaliações do usuário {UserId}", userId);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Obtém resumo de avaliações de um jogo
        /// </summary>
        [HttpGet("summary/{gameId}")]
        public async Task<IActionResult> GetGameRatingSummary(int gameId)
        {
            try
            {
                var summary = await _ratingService.GetGameRatingSummaryAsync(gameId);
                return Ok(new { success = true, data = summary, message = "Resumo de avaliações recuperado com sucesso" });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao buscar resumo de avaliações do jogo {GameId}", gameId);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }
    }
} 