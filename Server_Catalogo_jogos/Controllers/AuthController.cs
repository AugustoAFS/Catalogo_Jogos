using Microsoft.AspNetCore.Mvc;
using Application.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    [AllowAnonymous]
    public class AuthController : BaseController
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService, ILogger<AuthController> logger) 
            : base(logger)
        {
            _authService = authService;
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Dados inválidos", errors = ModelState });
                }

                var authResponse = await _authService.Login(loginDto);
                return Ok(new { success = true, data = authResponse, message = "Login realizado com sucesso" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro no login para o email {Email}", loginDto.Email_User);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Registra um novo usuário
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Dados inválidos", errors = ModelState });
                }

                var result = await _authService.Register(registerDto);
                return Ok(new { success = true, data = result, message = "Usuário registrado com sucesso" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro no registro");
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }
    }
}