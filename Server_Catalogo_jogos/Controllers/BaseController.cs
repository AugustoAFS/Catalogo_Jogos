using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public abstract class BaseController : ControllerBase
    {
        protected readonly ILogger _logger;

        protected BaseController(ILogger logger)
        {
            _logger = logger;
        }

        protected ActionResult<T> HandleResult<T>(T result)
        {
            if (result == null)
            {
                return NotFound(new { success = false, message = "Recurso não encontrado" });
            }

            return Ok(new { success = true, data = result, message = "Operação realizada com sucesso" });
        }

        protected ActionResult HandleSuccess(string message)
        {
            return Ok(new { success = true, message = message });
        }

        protected void LogInformation(string message, params object[] args)
        {
            _logger.LogInformation(message, args);
        }

        protected void LogWarning(string message, params object[] args)
        {
            _logger.LogWarning(message, args);
        }

        protected void LogError(Exception ex, string message, params object[] args)
        {
            _logger.LogError(ex, message, args);
        }
    }
} 