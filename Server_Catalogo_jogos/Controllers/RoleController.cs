using Microsoft.AspNetCore.Mvc;
using Application.DTOs;
using Core.Interfaces;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    [Authorize(Policy = "AdminPolicy")]
    public class RoleController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public RoleController(ApplicationDbContext context, ILogger<RoleController> logger) 
            : base(logger)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém todas as roles
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllRoles()
        {
            try
            {
                var roles = await _context.Roles.ToListAsync();
                var roleDtos = roles.Select(role => new { role.Id_Role, role.Name_Role });
                
                return Ok(new { success = true, data = roleDtos, message = "Roles recuperadas com sucesso" });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao buscar todas as roles");
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Obtém uma role por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoleById(int id)
        {
            try
            {
                var role = await _context.Roles.FindAsync(id);
                if (role == null)
                {
                    return NotFound(new { success = false, message = "Role não encontrada" });
                }

                return Ok(new { success = true, data = new { role.Id_Role, role.Name_Role }, message = "Role encontrada com sucesso" });
            }
            catch (Exception ex)
            {
                LogError(ex, "Erro ao buscar role com ID {RoleId}", id);
                return StatusCode(500, new { success = false, message = "Erro interno do servidor" });
            }
        }
    }
} 