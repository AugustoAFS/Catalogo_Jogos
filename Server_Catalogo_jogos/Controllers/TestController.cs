using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using System.Security.Claims;
using Infrastructure.Data;

namespace Controllers
{
    public class TestController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public TestController(ApplicationDbContext context, ILogger<TestController> logger) 
            : base(logger)
        {
            _context = context;
        }

        /// <summary>
        /// Teste de rota protegida - deve retornar informações do usuário autenticado
        /// </summary>
        [HttpGet("protected")]
        public IActionResult TestProtectedRoute()
        {
            try
            {
                // Obter informações do usuário do token JWT
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userName = User.FindFirst(ClaimTypes.Name)?.Value;
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;

                return Ok(new { 
                    success = true, 
                    message = "Rota protegida acessada com sucesso",
                    user = new {
                        id = userId,
                        name = userName,
                        email = userEmail
                    }
                });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao testar rota protegida");
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Teste de rota pública - não precisa de autenticação
        /// </summary>
        [HttpGet("public")]
        [AllowAnonymous]
        public IActionResult TestPublicRoute()
        {
            return Ok(new { 
                success = true, 
                message = "Rota pública acessada com sucesso",
                timestamp = DateTime.Now
            });
        }

        /// <summary>
        /// Verifica se um usuário existe no banco
        /// </summary>
        [HttpGet("user-exists/{email}")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckUserExists(string email)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email_User == email);

                if (user != null)
                {
                    return Ok(new { 
                        success = true, 
                        message = "Usuário encontrado",
                        user = new {
                            id = user.Id_User,
                            name = user.Name_User,
                            email = user.Email_User
                        }
                    });
                }
                else
                {
                    return Ok(new { 
                        success = false, 
                        message = "Usuário não encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao verificar usuário");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Erro interno do servidor",
                    error = ex.Message
                });
            }
        }
    }
} 