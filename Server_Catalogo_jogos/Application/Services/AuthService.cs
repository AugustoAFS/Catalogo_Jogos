using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Infrastructure.Data;
using Application.DTOs;
using Core.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;
using Core.Interfaces;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthService> _logger;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IMapper mapper, ILogger<AuthService> logger, IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> Login(LoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email_User == loginDto.Email_User);

            if (user == null || !VerifyPassword(loginDto.Password_User, user.Password_User))
            {
                throw new InvalidOperationException("Email ou senha inválidos");
            }

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id_User = user.Id_User,
                    Name_User = user.Name_User,
                    Email_User = user.Email_User,
                    Password_User = user.Password_User,
                    Id_Role = user.Id_Role
                }
            };
        }

        public async Task<AuthResponseDto> Register(RegisterDto registerDto)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email_User == registerDto.Email_User);

            if (existingUser != null)
            {
                throw new InvalidOperationException("Email já está em uso");
            }

            var user = new User
            {
                Name_User = registerDto.Name_User,
                Email_User = registerDto.Email_User,
                Password_User = HashPassword(registerDto.Password_User),
                Id_Role = registerDto.Id_Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id_User = user.Id_User,
                    Name_User = user.Name_User,
                    Email_User = user.Email_User,
                    Password_User = user.Password_User,
                    Id_Role = user.Id_Role
                }
            };
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSecret = _configuration["Jwt:Secret"] ?? 
                throw new InvalidOperationException("JWT Secret não configurado");
            var key = Encoding.ASCII.GetBytes(jwtSecret);

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id_User.ToString()),
                    new Claim(ClaimTypes.Name, user.Name_User),
                    new Claim(ClaimTypes.Email, user.Email_User),
                    new Claim(ClaimTypes.Role, user.Id_Role.ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(24), // Token válido por 24 horas
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            return HashPassword(password) == hashedPassword;
        }
    }
} 