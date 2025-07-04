using Microsoft.AspNetCore.Mvc;
using Application.DTOs;
using Core.Interfaces;
using Core.Entities;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    [Authorize(Policy = "AdminOrUserPolicy")]
    public class UserController : BaseController
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService, ILogger<UserController> logger) 
            : base(logger)
        {
            _userService = userService;
        }

        /// <summary>
        /// Obtém todos os usuários
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsers();
                return Ok(new { success = true, data = users, message = "Usuários recuperados com sucesso" });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao buscar todos os usuários");
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Obtém um usuário por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _userService.GetUserById(id);
                return Ok(new { success = true, data = user, message = "Usuário encontrado com sucesso" });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao buscar usuário com ID {UserId}", id);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Cria um novo usuário
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Dados inválidos", errors = ModelState });
                }

                var user = await _userService.CreateUser(createUserDto);
                return CreatedAtAction(nameof(GetUserById), new { id = user.Id_User }, 
                    new { success = true, data = user, message = "Usuário criado com sucesso" });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao criar usuário");
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Atualiza um usuário existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Dados inválidos", errors = ModelState });
                }

                var user = await _userService.UpdateUser(id, updateUserDto);
                return Ok(new { success = true, data = user, message = "Usuário atualizado com sucesso" });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao atualizar usuário com ID {UserId}", id);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Remove um usuário
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var result = await _userService.DeleteUser(id);
                if (!result)
                {
                    return NotFound(new { success = false, message = "Usuário não encontrado" });
                }

                return HandleSuccess("Usuário removido com sucesso");
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao deletar usuário com ID {UserId}", id);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }
    }
}